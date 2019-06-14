
const {
    createSession,
    closeSession,
    startWebDriver,
    stopWebDriver,
    client
  } = require('nightwatch-api');
  

async function setup(env = 'default') {
    await startWebDriver({ env });
    await createSession({ env });
}
  
async function shutdown() {
    await closeSession();
    await stopWebDriver();
}
  
async function run(stringUrl, seatsArray) {
    await client
        .url(stringUrl)

        for (var i = 0; i < seatsArray.length; ++i)
        {
            let seat = seatsArray[i];
            
            await client
            .pause(1000)
            .click('.seatrow > .seat > div[tooltip="'+ seat + '"] > .seatstatustype > .seatstatus > img')
        }
        await client
        .pause(1000)
        .click('.tickets-content > .movie-format > .row > div:nth-child(2) > .dropdown-toggle option[value="0"]')
        .pause(1000)
        .click('label[for="1"]')
        .pause(1000)
        .click('.page-button-group > button:nth-child(2)')
        .pause(1000)
        .assert.elementPresent(".button-section > button:nth-child(1)")
        .click('.button-section > button:nth-child(1)')
        .pause(2000)
}

module.exports.run = run;
module.exports.shutdown = shutdown;
module.exports.setup = setup;