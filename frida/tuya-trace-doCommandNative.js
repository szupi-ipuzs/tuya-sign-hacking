var loaderSwitched = false;

function dumpJavaBytes(v) {
  var buffer = Java.array('byte', v);
  var result = "";
  if (buffer === null) {
    return "(null)";
  }
  
  for(var i = 0; i < buffer.length; ++i){
    result+= (String.fromCharCode(buffer[i]));
  }
  return result;
}

function test(){
    Java.enumerateClassLoaders({
        onMatch: function (loader){
            try{
                if(loader.findClass("com.tuya.sdk.network.TuyaNetworkSecurity")){
                    console.log("found com.tuya.sdk.network.TuyaNetworkSecurity loader");
                    console.log(loader);
                    Java.classFactory.loader = loader;
                    loaderSwitched = true;
                }
            }catch(error){
            }
        },
        onComplete: function(){
            console.log("enumerateClassLoaders complete");
        }
    });
}
function starthook(){
    if(!loaderSwitched){
        console.log("loader not switched, return");
        return;
    }
    Java.use("com.tuya.sdk.network.TuyaNetworkSecurity").doCommandNative.implementation = function(ctx, cmd, v2, v3, v4, v5) {
        var ret = this.doCommandNative(ctx, cmd, v2, v3, v4, v5);
        send("doCommandNative: cmd=" + cmd + ", v2=" + dumpJavaBytes(v2) + ", v3=" + dumpJavaBytes(v3) + ", v4=" + v4 + ", v5=" + v5 + ", ret=" + ret);
        return ret;
    }
}
function main(){
    Java.perform(function(){
        setTimeout(() => {
            test();
        }, 2000);
        setTimeout(() => {
            starthook();
        }, 3000);
    });
}
setImmediate(main);
