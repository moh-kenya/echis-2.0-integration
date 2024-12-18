const crypto = require('crypto');
const axios = require('axios');

function generatePassword(password) {
    const passwordSalt = crypto.randomBytes(16);
    const salt = passwordSalt.toString('hex');
    const algorithm = 'sha512';

    const shasum = crypto.createHash(algorithm);
    shasum.update(salt);
    shasum.update(password);
    const passwordHash = shasum.digest('hex');
    console.log('gen', salt, passwordHash, algorithm);
    return {
        passwordSalt: salt,
        passwordHash,
        passwordAlgorithm: algorithm
    };
};

async function openhimAuth() {
    const response = await axios.get(`https://localhost:8080/authenticate/root@openhim.org`);
    if (!response.ok) {
        new Error(`User root@openhim.org not found when authenticating with core API`);
    }
    const authDetails = response.data;
    const { salt } = authDetails;
    const now = new Date();
    // create passhash
    let shasum = crypto.createHash('sha512');
    shasum.update(salt + 'openhim-password');
    const passhash = shasum.digest('hex');
    // create token
    shasum = crypto.createHash('sha512');
    shasum.update(passhash + salt + now);
    const token = shasum.digest('hex');
    // define request headers with auth credentials
    return {
        'auth-username': 'root@openhim.org',
        'auth-ts': now,
        'auth-salt': salt,
        'auth-token': token
    }
}

const CLIENT_ROLES = ['interop', 'echis'];
async function configChannel() {
    const chan = {
        methods: [
            'POST',
        ],
        type: 'http',
        allow: CLIENT_ROLES,
        authType: 'private',
        status: 'enabled',
        rewriteUrls: false,
        addAutoRewriteRules: true,
        autoRetryEnabled: false,
        autoRetryPeriodMinutes: 60,
        routes: [
            {
                type: 'http',
                status: 'enabled',
                forwardAuthHeader: false,
                name: 'echis-mediator',
                secured: false,
                host: 'mediator',
                port: 6000,
                path: '',
                pathTransform: 's/\/echis-mediator/',
                primary: true,
                username: '',
                password: ''
            }
        ],
        requestBody: true,
        responseBody: true,
        name: 'Mediator 2',
        urlPattern: '/echis-mediator/.*',
        priority: 1
    };
    const headers = await openhimAuth();
    return axios.post('https://localhost:8080/channels', JSON.stringify(chan), {
        headers: {
            ...headers,
            'Content-Type': 'application/json',
        }
    });
}

async function configUser(password) {
    const user = {
        groups: ['admin'],
        firstname: 'Interop',
        surname: 'User',
        email: 'interop@openhim.org',
        password
    };
    const headers = await openhimAuth();
    return axios.post('https://localhost:8080/users', JSON.stringify(user), {
        headers: {
            ...headers,
            'Content-Type': 'application/json',
        }
    });
}

async function configClient(password) {
    const { passwordSalt, passwordHash, passwordAlgorithm } = generatePassword(password);
    const client = {
        clientID: 'interop-client',
        name: 'Interoperability Client',
        roles: CLIENT_ROLES,
        password: password
    };
    console.log('client', JSON.stringify(client));
    const headers = await openhimAuth();
    return axios.post('https://localhost:8080/clients', JSON.stringify(client),
        {
            headers: {
                ...headers,
                'Content-Type': 'application/json',
            }
        });
}

async function setup() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    await configUser('medic@1234')
    await configClient('client@1234')
    await configChannel()

    await axios.put("http://localhost:5988/api/v1/credentials/mykey", 'client@1234', {
        auth: {
            username: 'admin',
            password: 'password',
        },
        headers: {
            'Content-Type': 'text/plain',
        }
    })
}

(async () => {
    await setup()
})()

