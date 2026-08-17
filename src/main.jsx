import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {AlertCircle,CheckCircle2,X} from 'lucide-react';
import App from './AppCloud.jsx';
import './styles.css';

const nativeAlert=window.alert.bind(window);
window.alert=(message)=>{
  window.dispatchEvent(new CustomEvent('gongyu-alert',{detail:{message:String(message||'發生未知問題')}}));
};

function AlertHost(){
  const[data,setData]=useState(null);
  useEffect(()=>{
    const handler=e=>setData(e.detail||{message:'發生未知問題'});
    window.addEventListener('gongyu-alert',handler);
    return()=>window.removeEventListener('gongyu-alert',handler);
  },[]);
  if(!data)return null;
  const text=data.message||'發生未知問題';
  const success=/成功|完成|已送出|驗證/.test(text)&&!/失敗|錯誤|Failed|error/i.test(text);
  return <div className="gyModalBackdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setData(null)}}>
    <div className="gyModal" role="alertdialog" aria-modal="true" aria-labelledby="gy-modal-title">
      <button className="gyModalClose" onClick={()=>setData(null)} aria-label="關閉"><X size={19}/></button>
      <div className={`gyModalIcon ${success?'success':'error'}`}>{success?<CheckCircle2 size={30}/>:<AlertCircle size={30}/>}</div>
      <h3 id="gy-modal-title">{success?'操作完成':'發生問題'}</h3>
      <p>{text==='Failed to fetch'?'目前無法連線到伺服器，請檢查網路後再試一次。':text}</p>
      <button className="gyModalPrimary" onClick={()=>setData(null)}>我知道了</button>
    </div>
  </div>
}

function Root(){return <><App/><AlertHost/></>}
createRoot(document.getElementById('root')).render(<Root/>);
