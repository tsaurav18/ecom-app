
import CryptoJS from "crypto-js";

const SECRET_KEY = 'T4LXYFqvDkzN7BpMjh3oWsR1V2gJ9uZk'
export function setItem(itemKey, itemValue) {
    try {
      localStorage.setItem(itemKey, JSON.stringify(itemValue));
    } catch (error) {
      console.error('Error setting item in localStorage:', error);
      return error;
    }
  }
  
  export function getItem(itemKey) {
    try {
      const jsonValue = localStorage.getItem(itemKey);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error getting item from localStorage:', error);
      return error;
    }
  }
  
  export function removeItem(itemKey) {
    try {
      localStorage.removeItem(itemKey);
      // console.log('Removed item from localStorage');
    } catch (error) {
      console.error('Error removing item from localStorage:', error);
      return error;
    }
  }
  
  export function clearItems() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return error;
    }
  }
  
  export const fetchValue = async (key) => {
    const value = await getItem(key);
    return value;
  };
  
function signHeader(plainBody, key) {
  var hash = CryptoJS.HmacSHA256(CryptoJS.enc.Utf8.parse(plainBody), key);
  var signature = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(hash));
  return signature
}

function verify_signature(data, signature, key) {

  var calc_signature = signHeader(data, key)
  if(signature == undefined || signature == null || signature == "" || calc_signature == undefined || calc_signature == null || calc_signature == "")
      return false;
  return signature == calc_signature;
}


// Drcrypt API response
export function decrypt(encryptedBody, key) {
  const keyBytes = CryptoJS.enc.Utf8.parse(key);
  const decrypted = CryptoJS.AES.decrypt(encryptedBody, keyBytes, {
  mode: CryptoJS.mode.ECB,
  padding: CryptoJS.pad.Pkcs7
})
return decrypted.toString(CryptoJS.enc.Utf8);
}
export function decryptAPIResponse(enc_data, signature){
  const decryptedData = decrypt(enc_data, SECRET_KEY)
  const sign_response = verify_signature(decryptedData, signature, SECRET_KEY)
  return sign_response
}


function encrypt(plainBody, keyBytes) {
  // const keyBytes = CryptoJS.enc.Utf8.parse(key);

  // Encrypt the plainBody using AES with ECB mode and PKCS7 padding
  const encrypted = CryptoJS.AES.encrypt(plainBody, keyBytes, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });

  return encrypted.toString();
}

function sign(plainBody, key) {
  const hash = CryptoJS.HmacSHA256(CryptoJS.enc.Utf8.parse(plainBody), key);
  const signature = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(hash));
  return signature;
}



export function getEncryptedData(reqData) {
  const secret = CryptoJS.enc.Utf8.parse(SECRET_KEY); // 32 bytes for AES-256
  // console.log("reqData before", reqData);

  reqData = JSON.stringify(reqData);
  // console.log("reqData after", reqData);
  
  const encData = encrypt(reqData || '', secret);
  const signature = sign(reqData, secret);

  // Prepare the body to be sent to the server
  const resBody = {
    enc_data: encData,
    signature: signature,
  };

  return resBody;
}



import { Platform } from "react-native";

const DEVICE_BASE_URL = {
  ios: "http://127.0.0.1:9999",
  android: "http://10.0.2.2:9999",
  default: "http://192.168.0.12:9999", // 실기기면 LAN IP로 교체
};

export const toDeviceUrl = (url) => {
  const DEVICE_BASE =
    Platform.OS === "ios" ? DEVICE_BASE_URL.ios : DEVICE_BASE_URL.android;
  // ✅ return 추가
  return url ? url.replace("http://localhost:9999", DEVICE_BASE) : url;
};
