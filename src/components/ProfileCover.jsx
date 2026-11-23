import {useState,useRef,useEffect} from 'react';
import {bannerBounds,frameBanner} from '../utils/bannerFraming';

// Share geometry between the editor, your journal and public member profiles.
export default function ProfileCover({url,fit='cover',focus=20,className='',children}) {
  const [image,setImage]=useState(null);
  const element=useRef(null);
  const [box,setBox]=useState(null);
  useEffect(()=>{const observer=new ResizeObserver(([entry])=>{setBox({width:entry.target.clientWidth,height:entry.target.clientHeight});});observer.observe(element.current);return()=>observer.disconnect();},[]);
  const hasCover=Boolean(url&&!url.startsWith('animated-'));
  const bounds=image&&image.url===url?bannerBounds(url,image.width,image.height):null;
  const ratio=bounds?bounds.width/(bounds.height-bounds.top-bounds.bottom):3;
  const mode=fit==='contain'?'contain':'cover';
  const position=Number.isFinite(Number(focus))?Math.max(0,Math.min(100,Number(focus))):20;
  const framing=bounds&&box&&(bounds.top||bounds.bottom)?frameBanner(bounds,box,mode,position):null;
  return <div ref={element} className={`${className} profile-responsive-cover`} data-fit={mode} data-focus={position} data-letterbox-corrected={Boolean(framing)} data-has-cover={hasCover}
    style={hasCover?{'--profile-banner':`linear-gradient(0deg,#101010,transparent),url(${url})`,backgroundImage:`linear-gradient(0deg,#101010,transparent),url(${url})`,backgroundSize:framing?.size||mode,backgroundPosition:framing?.position||`center ${position}%`,backgroundRepeat:'no-repeat','--cover-ratio':ratio}:undefined}>
    {hasCover&&<img className="profile-cover-measure" src={url} alt="" aria-hidden="true" onLoad={event=>{const {naturalWidth:width,naturalHeight:height}=event.currentTarget;if(width&&height)setImage({url,width,height});}}/>}
    {children}
  </div>;
}
