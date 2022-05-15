const Playoff = require('./playoff.js');
const Db = require('./database.js')

const PASSWORD = process.env['PASSWORD']
const USER = process.env['USER']

const app=module.exports = {
 login : async() => Playoff.login(USER, PASSWORD),

  getCachedToken : async()=>{
  const hit = await Db.getAsistencia('TOKEN','TOKEN');
  console.log(hit)
  const time = (new Date()).getTime();
  if (hit && hit.length){
    try{
      const cachedInfo = JSON.parse(hit[0])
      if ((time-cachedInfo.time)<60000){
        console.log("returned cached:", cachedInfo)
        return cachedInfo.token;
      }
      return null;
    }catch(e){
      console.error(e);
      return null;
    }
  }
  return null;
},

  setCachedToken : async(token) =>{
  console.log("caching token", token)
  const time = (new Date()).getTime();
  console.log(await Db.setAsistencia('TOKEN', 'TOKEN', JSON.stringify({token, time}), true));
},

  getToken : async ()=>{
    
    const cachedToken = await getCachedToken();
    
    if (cachedToken) {
      return cachedToken;
    }
  
    const token = await login();
    app.setCachedToken(token);
    
    return token;

}
}
