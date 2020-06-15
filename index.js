const AWS = require('aws-sdk');

var init = false;
var ssm;


exports.init = async function(parameters) {
    if (!init) {
        let config = parameters.config;
        let path = parameters.path;
        
        if(config != null) {
            AWS.config.update(config);                
        }
        
        ssm = new AWS.SSM(); // it MUST be initiated after config.update
        let data = await getParametersFromStore(path);
        exportParameters(data);
        init = true;
    }
}

async function getParametersFromStore(path) {
    let params = {
        Path: path
    };

    return new Promise((resolve, reject) => {
        ssm.getParametersByPath(params, function(err, data) {
            if (err) {
                throw new Error(err);
            } else {
                resolve(data.Parameters);
            }
        });
    });
}

function exportParameters(data) {
    for (let i = 0; i < data.length; i++) {
        let parameter = data[i];
        let key = parameter.Name.split('/');
        let property = key[key.length - 1];
        let value = parameter.Value;
        exports[property] = value;
    }
}