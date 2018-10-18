"use strict";

// Importing packages
const express = require('express');
const router  = express.Router();
// const app = express();
// const bodyParser = require('body-parser');
//



// Using packages
// app.set('view engine', 'ejs');
// app.use(bodyParser.urlencoded({extended: true}));

// base 36 to include all 26 letters and 10 numbers
// returns a numberOfChars long string starting at index 2
function generateRandomString(numberOfChars) {
  return Math.random().toString(36).substr(2, numberOfChars);
}

module.exports = (knex) => {
  // router.get("/", (req, res) => {
  //
  // });

  // Endpoint for getting the create-new-poll page
  router.get("/new", (req, res) => {
    res.render("../views/new_poll.ejs");
  });

  // Endpoint for admin access of poll
  // uses the unique URL to find the correct poll
  router.get("/:id/admin", (req, res) => {
    let templateVars = {};
    let pollID;

    knex.select('*').from('poll').where('randomURL', req.params.id).then(result => {
      templateVars.poll = result[0];
      pollID = templateVars.poll['id'];

      // once the correct poll is identified it is passed into the variables object
      // the pollID variable is used to find the appropriate options for this poll
    }).then(function() {
      return knex.select('*').from('response').where('poll_id', pollID).then(options2 => {
        templateVars.options = options2;

        // the options for this poll are added to the variables object
      }).then(function() {

        // ejs uses the variables to render the page
        res.render("../views/admin.ejs", templateVars);
      })
    })
  });

  // Endpoint for creating a poll. Redir to polls/:id/admin if success
  // where :id is a randomly generated 8 char long string
  router.post("/new", (req, res) => {
    // creates an object that knex can insert
    // the keys are the column names in the poll table
    let uniqueURL = generateRandomString(8);
    let newPoll = { text: req.body.question,
                    creator_email: req.body.email,
                    date_created: new Date(),
                    randomURL: uniqueURL,
                    end_date: req.body.end };

    // by default this router expects to receive all the options
    // in a JSON.stringify string
    let receivedOptions = JSON.parse(req.body.options);

    // next we insert the new question as a new instance of the poll table
    // insertion returns the unique id of the new poll
    let pollID;
    knex.table('poll').insert(newPoll).returning('id').then(id => {
      pollID = id[0];
    }).then(function() {

      // using the received pollid we can parse an array of objects
      // which knex can insert into the response table
      return receivedOptions.map(element => {
        return {poll_id: pollID, text: element};
      });
    }).then(result => {
      knex.table('response').insert(result).then(res.redirect(`../polls/${uniqueURL}/admin`));
    })
  });

  // This searches for and deletes a poll
  router.delete("/:id", (req, res) => {
    knex("poll")
      .select("*")
      .where("randomURL", req.params.id)
      .then(function(response) {
          if (req.session.email === response[0].creator_email) {
            knex("poll").where("randomURL", req.params.id).del().then(function(){
              console.log(req.params.id);
            });
          } else {
            res.redirect("/error")
          }
      });
  });

  // Endpoint for getting the voting page
  // Queries DB for randomURL and outputs data associated with the row
  router.get("/:id", (req, res) => {
    let variables = {};
    knex
      .select('*')
      .from('poll')
      .where('randomURL', req.params.id)
      .then(function(response) {
        variables.poll = response[0];
        res.render("../views/vote.ejs", variables);

      });
  });

  // Endpoint for submitting the vote. Redir to /polls/:id/votes on success
  // Logic is: find poll using randomURL; find responses using poll_id; find votes using
  //  response_id; loop through votes and responses and if reponse_id === id, increment
  router.post("/:id", (req, res) => {
    const variables = {};
    knex
      .select('*')
      .from('poll')
      .where('poll.randomURL', req.params.id)
      .then(function(response) {
        variables.poll = response[0];
        knex
          .select('*')
          .from('response')
          .where('poll_id', req.params.id)
          .then(function(response) {
            variables.responses = response;
            variables.responses.forEach(ele => {
              knex
                .select('*')
                .from('votes')
                .where('response_id', ele.id)
                .then(function(response) {
                  variables[ele.id]votes = response;
                  for (const vote of variables[ele.id]votes) {
                    for (const response of variables.responses) {
                      if (response.id === vote.response_id) {
                        variables[response]borda += vote.bordaValue;
                      }
                    }
                  }
              });
            });
            })
        })
    res.redirect("/:id/votes")
  });

  // Endpoint for displaying the current votes status
  router.get("/:id/votes", (req, res) => {
    let variables = {};
    let pollId;
    knex
      .select('*')
      .from('poll')
      .join('response')
      .where('poll.randomURL', req.params.id)
      .then(function(response) {
        variables.poll = response[0];
        pollId = variables.poll.id;
      }).then(function() {
        knex
          .select('*')
          .from('response')
          .where('poll_id', pollId)
          .then(function(response) {
            variables.responses = response[0];
          });
        });
    res.render("../views/vote_finished.ejs");
  });


  // Searches for a poll based on randomURL and if owner, searches for specific
  //  response using id, then deletes
  router.delete("/:id/:response", (req, res) => {
    knex
      .select('*')
      .from('poll')
      .where('poll.randomURL', req.params.id)
      .then((response) => {
        if (req.session.email === response[0].creator_email) {
        knex('response')
          .where('poll_id', response[0].id)
          .andWhere('id', req.params.response)
          .del()
          .then(function(){
            console.log('attempting delete')
          });
        }
      });
  });



  return router;
}
