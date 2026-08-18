import React from 'react';
import{Users}from'lucide-react';

export default function MemberLauncher(){
  return <button onClick={()=>{window.location.href='./member-center-test/'}} style={{position:'fixed',right:16,bottom:88,zIndex:40,border:0,borderRadius:999,padding:'11px 15px',background:'#246fd8',color:'#fff',fontWeight:800,boxShadow:'0 10px 28px #0006',display:'flex',alignItems:'center',gap:7}}><Users size={17}/>找會員</button>
}
