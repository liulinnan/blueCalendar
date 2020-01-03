const CryptoJS = require('./aes.js');  //引用AES源码js
const key = CryptoJS.enc.Utf8.parse("0fij!903-00~ij,90/i00fij.90+i023");  //十六位十六进制数作为密钥
const iv = CryptoJS.enc.Utf8.parse('0362172205940330');   //十六位十六进制数作为密钥偏移量
/**
 * 加密
 * word：原密码
 * key ：key
 * iv  ： iv
 */
function encrypt(data) {
  var srcs = CryptoJS.enc.Utf8.parse(data);
  var encrypted = CryptoJS.AES.encrypt(srcs, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.ciphertext.toString(CryptoJS.enc.Base64)
  //return CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
}
 
/**
 * 解密
 * word：加密后的密码
 * key ：key
 * iv  ： iv
 */
function decrypt(data) {
  let baseResult = CryptoJS.enc.Base64.parse(data);   // Base64解密
  let ciphertext = CryptoJS.enc.Base64.stringify(baseResult);     // Base64解密
  let decryptResult = CryptoJS.AES.decrypt(ciphertext, key, {    //  AES解密
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  //return decrypted.toString(CryptoJS.enc.Utf8);
  let resData = decryptResult.toString(CryptoJS.enc.Utf8).toString();
  return resData;
}

module.exports = {
  encrypt,
  decrypt
}
