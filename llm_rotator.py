import itertools
import time

import litellm
from litellm.exceptions import RateLimitError

# Original function ka reference rakhte hain taake usay wrap kar sakein.
_original_completion = litellm.completion

_enabled = False


def enable_key_rotation(api_keys, cooldown_seconds=65):
    """
   Call it once when the program starts. After that, every litellm completion call will automatically use rotation.
    """
    global _enabled
    if _enabled:
        return  # dobara enable n

    keys = list(api_keys)
    if len(keys) < 2:
        return  # sirf ek key hai to rotate karne ki zaroorat nahi

    key_cycle = itertools.cycle(keys)
    cooldown_until = {}  # key -> timestamp jab tak avoid karna hai

    def _pick_key():
        now = time.time()
        for _ in range(len(keys)):
            k = next(key_cycle)
            if now >= cooldown_until.get(k, 0):
                return k
        # Sab cooldown mein hain — jo sabse jaldi free hogi wo lo
        return min(keys, key=lambda k: cooldown_until.get(k, 0))

    def rotating_completion(*args, **kwargs):
        last_error = None
        for attempt in range(len(keys)):
            key = _pick_key()
            kwargs["api_key"] = key  # CrewAI ne jo bhi key di ho, override kar do
            try:
                return _original_completion(*args, **kwargs)
            except RateLimitError as e:
                last_error = e
                cooldown_until[key] = time.time() + cooldown_seconds
                print(
                    f"[llm_rotator] Key rate-limited, try next key "
                    f"(attempt {attempt + 1}/{len(keys)})..."
                )
        raise last_error

    litellm.completion = rotating_completion
    _enabled = True
    print(f"[llm_rotator] {len(keys)} Groq API keys rotation enabled.")