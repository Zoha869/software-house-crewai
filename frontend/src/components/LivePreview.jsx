import React, { useMemo, useState } from 'react'; 
import { Monitor, Terminal, RefreshCw, ExternalLink, Globe2, ServerCog, Boxes } from 'lucide-react';

function buildSrcDoc(files) { 
  const htmlFile = files.find(f => /\.html?$/.test(f.path)); 
  if (!htmlFile) return null; 
  
  if (/<script[^>]+src=["'][^"']*\.(tsx|jsx)["']/i.test(htmlFile.code)) return null; 
  
  let html = htmlFile.code; 
  const findByName = (name) => files.find(f => f.path.split('/').pop() === name); 
  
  html = html.replace(/<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi, (match, href) => { 
    const cssFile = findByName(href.split('/').pop()); 
    return cssFile ? `<style>\n${cssFile.code}\n</style>` : match; 
  }); 
  
  html = html.replace(/<script[^>]+src=["']([^"']+\.js)["'][^>]*><\/script>/gi, (match, src) => { 
    const jsFile = findByName(src.split('/').pop()); 
    return jsFile ? `<script>\n${jsFile.code}\n</script>` : match; 
  }); 
  
  return html; 
} 

function detectsBundlerProject(files) { 
  const hasReactEntry = files.some(f => /(^|\/)(main|index)\.(tsx|jsx)$/.test(f.path)); 
  const htmlFile = files.find(f => /\.html?$/.test(f.path)); 
  const htmlNeedsBundler = htmlFile && /<script[^>]+src=["'][^"']*\.(tsx|jsx)["']/i.test(htmlFile.code); 
  const hasPackageJson = files.some(f => f.path.split('/').pop() === 'package.json' && /"(react|vite)"/.test(f.code)); 
  
  return hasReactEntry || htmlNeedsBundler || hasPackageJson; 
} 

function detectEndpoints(files) { 
  const endpoints = []; 
  const patterns = [ 
    /@app\.(get|post|put|delete|patch)\(\s*["']([^"']+)["']/gi, 
    /router\.(get|post|put|delete|patch)\(\s*["']([^"']+)["']/gi, 
    /app\.(get|post|put|delete|patch)\(\s*["']([^"']+)["']/gi, 
  ]; 
  
  files.forEach(f => { 
    patterns.forEach(re => { 
      let m; 
      while ((m = re.exec(f.code)) !== null) { 
        endpoints.push({ method: m[1].toUpperCase(), path: m[2], file: f.path }); 
      } 
    }); 
  }); 
  
  return endpoints; 
} 

export default function LivePreview({ files }) { 
  const [reloadKey, setReloadKey] = useState(0); 
  const srcDoc = useMemo(() => buildSrcDoc(files), [files]); 
  const needsBundler = useMemo(() => !srcDoc && detectsBundlerProject(files), [files, srcDoc]); 
  const endpoints = useMemo(() => (srcDoc || needsBundler ? [] : detectEndpoints(files)), [files, srcDoc, needsBundler]); 
  
  if (!files || files.length === 0) { 
    return null; 
  } 
  
  if (srcDoc) { 
    return ( 
      <div className="live-preview"> 
        <div className="live-preview-toolbar"> 
          <div className="live-preview-badge browser"> 
            <Globe2 size={13} /> 
            <span>Browser Preview</span> 
          </div> 
          <button className="btn-secondary btn-xs" onClick={() => setReloadKey(k => k + 1)}> 
            <RefreshCw size={12} /> 
            <span>Reload</span> 
          </button> 
        </div> 
        <div className="live-preview-frame-wrap"> 
          <div className="live-preview-chrome"> 
            <span className="chrome-dot" style={{ background: '#F58080' }} /> 
            <span className="chrome-dot" style={{ background: '#E8935B' }} /> 
            <span className="chrome-dot" style={{ background: '#5AD1A8' }} /> 
          </div> 
          <iframe key={reloadKey} title="Project Preview" srcDoc={srcDoc} sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups" className="live-preview-iframe" /> 
        </div> 
      </div> 
    ); 
  } 
  
  if (needsBundler) { 
    return ( 
      <div className="live-preview"> 
        <div className="live-preview-toolbar"> 
          <div className="live-preview-badge server"> 
            <Boxes size={13} /> 
            <span>React / Bundler Project — Run Locally to Preview</span> 
          </div> 
        </div> 
        <div className="live-preview-terminal"> 
          <div className="live-preview-chrome"> 
            <Terminal size={13} /> 
            <span>Run it on your machine</span> 
          </div> 
          <div className="terminal-body"> 
            <p className="terminal-line muted"> $ this project uses React (and a bundler like Vite), so it needs a real dev server — a browser preview can't run it directly. Download the files, then: </p> 
            <p className="terminal-line">npm install</p> 
            <p className="terminal-line">npm run dev</p> 
            <p className="terminal-line muted">$ then open the localhost link it prints.</p> 
          </div> 
        </div> 
      </div> 
    ); 
  } 
  
  return ( 
    <div className="live-preview"> 
      <div className="live-preview-toolbar"> 
        <div className="live-preview-badge server"> 
          <ServerCog size={13} /> 
          <span>No Browser Preview — Backend / Script Project</span> 
        </div> 
      </div> 
      <div className="live-preview-terminal"> 
        <div className="live-preview-chrome"> 
          <Terminal size={13} /> 
          <span>What this project does when it runs</span> 
        </div> 
        <div className="terminal-body"> 
          {endpoints.length > 0 ? ( 
            <> 
              <p className="terminal-line muted">$ this project exposes the following API endpoints:</p> 
              {endpoints.map((ep, i) => ( 
                <p className="terminal-line" key={i}> 
                  <span className={`method-tag method-${ep.method.toLowerCase()}`}>{ep.method}</span> 
                  <span>{ep.path}</span> 
                  <span className="terminal-file-hint">{ep.file}</span> 
                </p> 
              ))} 
            </> 
          ) : ( 
            <p className="terminal-line muted"> $ this is a script/backend project — download the files and run it locally to see it in action. </p> 
          )} 
        </div> 
      </div> 
    </div> 
  ); 
}
