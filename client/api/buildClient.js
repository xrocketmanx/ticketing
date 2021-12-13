import axios from 'axios';

const buildClient = ({ req }) => {
    if (typeof window === 'undefined') {
        // We are on server
        return axios.create({
            baseURL: 'http://alexamirov-ticketing-app-prod.xyz/',
            headers: req.headers
        });
    } else {
        // We are on client
        return axios.create({
           baseURL: '/'
        });
    }
};

export default buildClient;
