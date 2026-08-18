import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {AlertCircle,CheckCircle2,X} from 'lucide-react';
import App from './AppCloud.jsx';
import MemberCenterTest from './MemberCenterTest.jsx';
import './styles.css';

const translateMessage=(raw)=>{
  const text=String(raw||'發生未知問題');
  const lower=text.toLowerCase();
  if(lower.includes('failed to fetch')||lower.includes('networkerror')||lower.includes('network request failed')) return '目前無法連線到伺服器，請檢查網路後再試一次。';
  if(lower.includes('invalid login credentials')) return 'Email 或密碼錯誤，請重新確認後再試一次。';
  if(lower.includes('email not confirmed')) return '這個 Email 尚未完成驗證，請先到信箱點擊驗證連結。';
  if(lower.includes('user already registered')||lower.includes('already been registered')) return '這個 Email 已經註冊過了，請直接登入。';
  if(lower.includes('password should be at least')||lower.includes('password must be at least')) return '密碼長度不足，請至少輸入 6 個字元。';
  if(lower.includes('unable to validate email address')||lower.includes('invalid email')) return 'Email 格式不正確，請重新確認。';
  if(lower.includes('signup is disabled')) return '目前暫停開放新會員註冊。';
  if(lower.includes('email rate limit exceeded')||lower.includes('rate limit')) return '操作太頻繁，請稍等一下再試。';
  if(lower.includes('new row violates row-level security')||lower.includes('row-level security')) return '目前沒有權限執行這個操作，請重新登入後再試。';
  if(lower.includes('jwt expired')) return '登入狀態已過期，請重新登入。';
  if(lower.includes('duplicate key value')) return '這筆資料已經存在，無法重複新增。';
  if(lower.includes('bucket not found')) return '圖片儲存空間尚未設定完成，請稍後再試。';
  if(lower.includes('payload too large')||lower.includes('file size')) return '圖片檔案太大，請縮小後再重新上傳。';
  return text;
};

window.alert=(message)=>{
  window.dispatchEvent(new CustomEvent('gongyu-alert',{detail:{message:translateMessage(message)}}));
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
  const success=/成功|完成|已送出|驗證信已寄出/.test(text)&&!/失敗|錯誤|無法|尚未|不正確|過期/i.test(text);
  return <div className="gyModalBackdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setData(null)}}>
    <div className="gyModal" role="alertdialog" aria-modal="true" aria-labelledby="gy-modal-title">
      <button className="gyModalClose" onClick={()=>setData(null)} aria-label="關閉"><X size={19}/></button>
      <div className={`gyModalIcon ${success?'success':'error'}`}>{success?<CheckCircle2 size={30}/>:<AlertCircle size={30}/>}</div>
      <h3 id="gy-modal-title">{success?'操作完成':'發生問題'}</h3>
      <p>{text}</p>
      <button className="gyModalPrimary" onClick={()=>setData(null)}>我知道了</button>
    </div>
  </div>
}

function Root(){return <><App/><MemberCenterTest/><AlertHost/></>}
createRoot(document.getElementById('root')).render(<Root/>);
