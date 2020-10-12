const {FSWebcam, capture} = require('node-webcam')
const path = require('path')
const fs = require('fs')
const {PythonShell} = require('python-shell')

let _capture_index = 1

let python_options = {
    mode: 'text',
    //pythonPath: 'path/to/python',
    //pythonOptions: ['-u'], // get print results in real-time
    scriptPath: `${__dirname}/tools/`,
    args: ['-i',`${__dirname}/receipt001.jpg`]
  };

var cam = new FSWebcam({
    device: '/dev/video0',
    output: 'png'
})

// var cam = require('linuxcam')
// cam.start("/dev/video0", 1200, 798)

module.exports = {
    name: 'camera',
    middlewares: [],
    actions: {
        orientation: {
            params: {

            },
            handler(ctx){
                return new this.Promise((resolve,reject)=>{
                    PythonShell.run('correct.py',python_options,(err,results)=>{
                        if(err)
                            reject(err)
                        console.log('results: %j', results)
                        resolve(results)
                    })
                })
            },
        },
        list: {
            params: {

            },
            handler(ctx){
                return new this.Promise((resolve,reject)=>{
                    fs.readdir('/sys/class/video4linux/', (err, files) => {
                        if(err){
                            return reject('Unable to scan for v4l2 capture devices: ' + err)
                        }
                        let camera_devices = []
                        files.forEach((deviceName) => {
                            camera_devices.push(deviceName)
                        })
                        resolve(camera_devices)
                    })
                })
                
            }
        },
        capture: {
            params: {

            },
            handler(ctx) {
                return new this.Promise((resolve,reject)=>{
                    cam.capture( `cap${String(_capture_index).padStart(4,'0')}`, function( err, data ) {
                        if(err)
                            return reject(err   )
                        _capture_index++
                        resolve()
                    })
                })
            }
        }
    }
}