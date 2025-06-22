import  sendEmail  from "./emailService.js";

const sendEmailFun = async({to,subject,text,html})=>{
    const result = await sendEmail(to, subject, text, html);
    
    if(result.success){
        return true;
        // result.status(200).json({message:'Email sent successfully', messageId: result.messageId})
    }else{
        return false
        // result.status(500).json({message:'Failed to  sent email', error: result.error})
    }
}

export default sendEmailFun;