require('module-alias/register')
const path = require('path')
const { ServiceBroker } = require('moleculer')
const dotenv = require('dotenv')

let {parsed, error} = dotenv.config()
if(error)
    throw error

const {
    SERVICE_LIST,
    SERVICE_EXCLUSION_LIST,
    SERVICE_DIR,
    NODEID,
    NAMESPACE,
    LOG_LEVEL
} = parsed

const loadService = (_BROKER, _SERVICE) =>
    new Promise((resolve, reject) => {
        if(!SERVICE_EXCLUSION_LIST.split(',').includes(_SERVICE)){
            let FN = path.join(SERVICE_DIR, `${String(_SERVICE).trim()}/index.service.js`)
            let _SVC = broker.loadService(FN)
            
            broker.logger.info('Loaded', _SERVICE, FN)
            let deps = _SVC.dependencies || []
            resolve(Promise.all(deps.map(s =>
                loadService(broker, s))))
        return
        }
        reject(`Service in exclusion list '${_SERVICE}'`)
    })

const broker = new ServiceBroker({
    nodeID: NODEID,
    namespace: NAMESPACE,
    logger: true,
    logLevel: LOG_LEVEL,
    transporter: {
        type: "TCP",
        options: {
            // Enable UDP discovery
            udpDiscovery: true,
            // Reusing UDP server socket
            udpReuseAddr: true,

            // UDP port
            udpPort: 4445,
            // UDP bind address (if null, bind on all interfaces)
            udpBindAddress: null,
            // UDP sending period (seconds)
            udpPeriod: 30,

            // Multicast address.
            udpMulticast: "239.0.0.0",
            // Multicast TTL setting
            udpMulticastTTL: 1,

            // Send broadcast (Boolean, String, Array<String>)
            udpBroadcast: false,

            // TCP server port. Null or 0 means random port
            port: null,
            // Static remote nodes address list (when UDP discovery is not available)
            urls: null,
            // Use hostname as preffered connection address
            useHostname: true,

            // Gossip sending period in seconds
            gossipPeriod: 2,
            // Maximum enabled outgoing connections. If reach, close the old connections
            maxConnections: 32,
            // Maximum TCP packet size
            maxPacketSize: 1 * 1024 * 1024            
        }
    },
    requestTimeout: 5 * 1000,
    hotReload: true,
    circuitBreaker: {
        enabled: false
    },
    metrics: {
        params: true,
        meta: true
    }
})

try{
    let servicesLoaded = Promise.all(SERVICE_LIST.split(',')
        .map(s =>
            loadService(broker,s)))
    
    servicesLoaded
        .then(_ =>
            broker.logger.info('Services loaded'))
        .catch(error =>
            broker.logger.error(error))
    broker.start()
}catch(e){
    console.error(e)    
}
