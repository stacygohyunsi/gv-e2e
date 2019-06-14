
const term = require('terminal-kit').terminal;
const rp = require('request-promise');
const CONSTANTS = require('./consts');
const runNightwatch = require('./runNightwatch');

term.magenta( 'Hello there! Welcome to GV seating plan! \n\n' );
term.cyan( 'Which cinema are you going to?\n' );

term.grabInput();

term.on( 'key' , function( name ) {  
    if ( name === 'CTRL_C' ) { process.exit(); }
});

term.singleColumnMenu( CONSTANTS.ITEMS , function( error , response ) {
	term( '\n' ).eraseLineAfter.gray(
		"selected: %s\n" ,
		response.selectedText
    );
    let cinemaId = CONSTANTS.CINEMAVALUES[response.selectedText];
    var options = {
        uri: 'https://www.gv.com.sg/.gv-api/v2quickbuyfilms',
        body: {
            cinemaId: cinemaId
        },
        method: 'POST',    
        headers: {
            'origin': 'https://www.gv.com.sg', 
            'content-type': 'application/json; charset=UTF-8', 
            'referer': 'https://www.gv.com.sg/'
        },
        json: true
    };
    

    rp(options)
        .then(function (repos) {
            let arrangedMovies = [];
            repos.data.forEach((movie) => {
                arrangedMovies.push(movie.filmCd + ':' + movie.filmTitle); 
            });

            term.cyan( '\nWhich movie are you watching?\n' ) ;
            term.singleColumnMenu( arrangedMovies , function( error , response ) {
                term( '\n' ).eraseLineAfter.gray(
                    "selected: %s\n" ,
                    response.selectedText
                );
                let movie = response.selectedText.substring(0, 4);
                term.cyan( '\nWhat hall is the movie in (e.g., 4):\n' ) ;
                term.inputField(
                    function( error , input ) {
                        let hall = parseInt(input, 10);
                        term.cyan( '\n\nThe movie is happening...\n' ) ;
                        term.singleColumnMenu( ['today', 'tomorrow'] , function( error , response ) { 
                            term( '\n' ).eraseLineAfter.gray(
                                "selected: %s\n" ,
                                response.selectedText
                            );

                            let today = new Date();
                            var tomorrow = new Date();
                            tomorrow.setDate(today.getDate()+1);
                            let dateSelected = (response.selectedIndex === 0) ? today: tomorrow;

                            var dd = String(dateSelected.getDate()).padStart(2, '0');
                            var mm = String(dateSelected.getMonth() + 1).padStart(2, '0'); //January is 0!
                            var yyyy = dateSelected.getFullYear();

                            let dateUsed = dd + '-' + mm + '-' + yyyy;
                            
                            term.cyan( '\n\nWhat time is the movie starting? (e.g., 2359)\n' ) ;

                            term.inputField(function( error , input ) {
                                let timeUsed = parseInt(input, 10);
                                term.cyan( '\n\nWhat seats should I block of? Seats should be separated with commas. (e.g., D:06,D:12)\n' ) ;
                            
                                term.inputField(function( error , input ) {
                                    let seats = input.split(",");

                                    let stringUrl = 'https://www.gv.com.sg/GVSeatSelection#/cinemaId/' + cinemaId + '/filmCode/' + movie + '/showDate/'+ dateUsed + '/showTime/'+ timeUsed +'/hallNumber/' + hall;
                                    startNightwatch(stringUrl, seats);
                                    setInterval(function() {
                                        startNightwatch(stringUrl, seats);
                                    }, 660000)
                                });
                                
                            });
                        });
                    }
                );
                
            });
        })
        .catch(function (err) {
            console.log('failed', err);
        });
	// process.exit() ;
} ) ;


function startNightwatch(stringUrl, seats) {
    (async function() {
        try {
        await runNightwatch.setup('chrome');
        await runNightwatch.run(stringUrl, seats);
        } catch (err) {
            console.log(err.stack);
        } finally {
        await runNightwatch.shutdown();
        }
    })();
}
