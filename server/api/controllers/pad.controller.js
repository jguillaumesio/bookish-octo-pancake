const fs = require("fs");
const path = require("path");
const {exec} = require("child_process");

const installDirectory = `${appRoot}/public/installation`;

const disableUAC = async () => {
    const command = "reg ADD HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System /v EnableLUA /t REG_DWORD /d 0 /f";
    try {
        await new Promise((resolve, reject) => {
            try{
                exec(command, (error, stdout, stderr) => {
                    if (error) return reject(error)
                    if (stderr) return reject(error)
                    return resolve(stdout)
                });
            }catch(e){
                reject(e);
            }
        });
        return true;
    } catch (e) {
        return false;
    }

}

const installDriverSilently = async (infPath) => {
    const command = `pnputil -i -a ${infPath}`;
    try {
        await new Promise((resolve, reject) => {
            try{
                exec(command, (error, stdout, stderr) => {
                    if (error) return reject(error)
                    if (stderr) return reject(error)
                    return resolve(stdout)
                });
            }catch(e){
                reject(e);
            }
        });
        return true;
    } catch (e) {
        return false;
    }
}

const installMsiSilently = async (exePath) => {
    const command = `msiexec /i ${exePath} /passive`;
    try {
        await new Promise((resolve, reject) => {
            try{
                exec(command, (error, stdout, stderr) => {
                    if (error) return reject(error)
                    if (stderr) return reject(error)
                    return resolve(stdout)
                });
            }catch(e){
                reject(e);
            }
        });
        return true;
    } catch (e) {
        return false;
    }
}

module.exports = (app, igdbToken) => {
    const module = {};
    module.installBluetooth = async (req, res) => {
        //disable UAC
        const UACStep = await disableUAC();
        if(!UACStep){
            res.send({
                "type":"error",
                "message":"Error while disabling UAC"
            });
            return;
        }

        //install BthPS3 (bluetooth PS3 utility)
        const PS3BluetoothStep = await installMsiSilently(`public\\installation\\BthPS3Setup_x64.msi`);
        if(!PS3BluetoothStep){
            res.send({
                "type":"error",
                "message":"Error while installing bluetooth utility"
            });
            return;
        }
        console.log("Bluetooth utility");
    }

    module.installPad = async (req, res) => {
        //install driver
        const PS3PadDriverStep = await installDriverSilently(`public\\installation\\dshidmini_v2.2.282.0\\x64\\dshidmini\\dshidmini.inf`);
        if(!PS3PadDriverStep){
            res.send({
                "type":"error",
                "message":"Error while installing drivers"
            });
            return;
        }

        //install driver
        const PS3IgFilterDriverStep = await installDriverSilently(`public\\installation\\dshidmini_v2.2.282.0\\x64\\dshidmini\\igfilter.inf`);
        if(!PS3IgFilterDriverStep){
            res.send({
                "type":"error",
                "message":"Error while installing drivers"
            });
            return;
        }

        res.send({
            "type":"success"
        });

        //wait for controller to be plugged
        //open DSHMC.exe to see if controller is recognized
    }

    return module;
}
