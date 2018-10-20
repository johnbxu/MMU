"use strict";

// Importing packages
const express = require("express");
const router  = express.Router();

// Mailgun
const api_key = process.env.MAILGUN_API;
const DOMAIN = process.env.MAILGUN_DOMAIN;
const mailgun = require("mailgun-js")({apiKey: api_key, domain: DOMAIN});

// base 36 to include all 26 letters and 10 numbers
// returns a numberOfChars long string starting at index 2
function generateRandomString(numberOfChars) {
	return Math.random().toString(36).substr(2, numberOfChars);
}

module.exports = (knex) => {
  const checkIfExists = (id) => {
    return knex('poll')
      .select('*')
      .where('randomURL', id)
      .then((response) => {
        return response.length > 0;
      });
  }
	const computeBorda = (req) => {
		const sum = {};
		knex("poll")
			.join("response", "poll.id","=", "response.poll_id")
			.join("vote", "vote.response_id", "=", "response.id")
			.select("*")
			.where("poll.randomURL", req.params.id)
			.then(function(table) {
				table.forEach(vote => {
					if (!sum[vote.response_id]) {
						sum[vote.response_id] = 0;
					}
					sum[vote.response_id] += vote.bordaValue;
				});
				for (let id in sum) {
					knex("response")
						.where("id", Number(id))
						.update("borda", sum[id])
						.then(function(){
							console.log(`Borda value updated for response id: ${id}`);
						});
				}
			});
	};

	// Endpoint for getting the create-new-poll page
	router.get("/new", (req, res) => {
		res.render("../views/new_poll.ejs");
	});

	// Endpoint for creating a poll. Redir to polls/:id/votes if success
	// where :id is a randomly generated 8 char long string

	router.post("/new", (req, res) => {
		// creates an object that knex can insert
		// the keys are the column names in the poll table
		// res.clearCookie("session");

		let receivedData = req.body;

		const uniqueURL = generateRandomString(8);
		const newPoll = { text: receivedData.question,
			creator_email: receivedData.email,
			date_created: new Date(),
			randomURL: uniqueURL,

			end_date: receivedData.end,
			creator_name: receivedData.name};

		// by default this router expects to receive all the options as JSON
		let receivedOptions = receivedData.options;

		// next we insert the new question as a new instance of the poll table
		// insertion returns the unique id of the new poll
		let pollID;
		knex.table("poll").insert(newPoll).returning("id").then(id => {
			pollID = id[0];
		}).then(function() {
			req.session.email = receivedData.email;
			// using the received pollid we can parse an array of objects
			// which knex can insert into the response table
			return receivedOptions.map(element => {
				return {poll_id: pollID, response_text: element.response, description: element.description,borda: 0};

			});
		}).then((result) => {
			knex.table("response").insert(result).then(function(){
				const data = {
					from: "Mind Maker Upper <me@samples.mailgun.org>",
					to: receivedData.email,
					subject: "Your new poll has been created",
					text: `
					You asked the question: ${receivedData.question}
					To edit/delete the page, visit the administrator link here: http://localhost:8080/polls/${uniqueURL}/admin
					You should send all the participants the following link so they can vote: http://localhost:8080/polls/${uniqueURL}/votes
					We hope you find an answer at long last!`
				};
				mailgun.messages().send(data, function (error, body) {
					console.log("emailed");
				});
			}).then(function(response){
				res.status(200).json({url: `/polls/${uniqueURL}/admin`});
			});
		});
	});

	// This searches for and deletes a poll
	router.delete("/:id", (req, res) => {
		console.log("attempting delete");
		knex("poll")
			.select("*").where("randomURL", req.params.id).then(function(response) {
				if (req.session.email === response[0].creator_email) {
					knex("response").where("poll_id", response[0].id).del().then(function(){
						knex("poll").where("randomURL", req.params.id).del().then(function() {
							console.log("poll deleted");
							res.redirect("/");
						});
					});
				} else {
					let templateVars = {errorCode: 500, errorMessage: "Unauthorized"};
					res.render("./error.ejs", templateVars);
				}
			});
	});

	// Endpoint for submitting the vote. Redir to /polls/:id/votes on success
	// Logic is: find poll using randomURL; find responses using poll_id; find votes using
	// response_id; loop through votes and responses and if reponse_id === id, increment
	router.put("/:id", (req, res) => {
		const options = req.body.obj;
		const voterName = req.body.voterName;

		// we save the vote
		for (let i = 0; i < options.length; i++) {
			knex("vote").insert({"response_id": options[i], "bordaValue": options.length - i}).then(()=>{
				console.log("inserting into vote table response_id", options[i], "bordaValue", options.length - i);
			});
		}
		const insertBorda = new Promise(function(resolve, reject) {
			for (let i = 0; i < options.length; i++) {
				knex("response")
					.where("id", options[i])
					.update({ borda: options.length - i })
					.then(() => { console.log("updated borda"); });
			}
		});

		insertBorda;

		computeBorda(req);

		knex("poll")
			.where("randomURL", req.params.id)
			.select("creator_email")
			.then(response => {
				console.log("response from poll knex",response);
				const data = {
					from: "Mind Maker Upper <me@samples.mailgun.org>",
					to: response[0].creator_email,
					subject: `${voterName} has voted on your poll`,
					text: `${voterName} has voted on your poll! Check it out at http://localhost:8080/polls/${req.params.id}/admin.
              Use your email and name to log into admin access.`
				};
				mailgun.messages().send(data, function (error, body) {
					console.log("emailed");
					res.json({pollID: "test", creator_name: "name"});
				});
			});
	});

	router.get("/:id/admin", (req, res) => {
		let templateVars = {};
    checkIfExists(req.params.id).then((response) => {
      if (response) {
    		knex("poll")
    			.join("response", "poll.id","=", "response.poll_id")
    			.select("*")
    			.where("poll.randomURL", req.params.id)
    			.orderBy("borda")
    			.then(function(table) {
    				templateVars.responses = table;
    				if (req.session.email === table[0].creator_email) {
    					templateVars.loggedIn = true;
    				} else {
    					templateVars.loggedIn = false;
    				}
    				res.render("../views/admin.ejs", templateVars);
    			});
      } else {
        templateVars = {errorCode: 404, errorMessage: "Cannot find poll"};
        res.render("./error.ejs", templateVars);
      }
    });
	});

	// Updates a poll
	router.post("/:id/update", (req, res) => {
		knex("response")
      .join("poll", "poll.id", "=", "response.poll_id")
      .select("response.id")
			.where("poll.randomURL", req.params.id)
			.then((response) => {
        console.log(response);
				if (req.session.email === response[0].creator_email) {
          Promise.all([
            response.map(vote => {
              return knex("vote")
                .where("response_id", vote.id)
                .del();
            })
          ]).then(function () {
            console.log('Deleted');
          });
        }
				// 	knex("response")
				// 		.where("poll_id", response[0].id)
				// 		.andWhere("id", req.params.response)
				// 		.update({
				// 			text: req.body.text
				// 		})
				// 		.then(function(){
				// 			console.log("attempting update");
				// 			res.redirect(`/polls/${req.params.id}/votes`);
				// 		});
				// } else {
				// 	let templateVars = {errorCode: 500, errorMessage: "Unauthorized"};
				// 	res.render("./error.ejs", templateVars);
				// }
			});
	});

	// Endpoint for displaying the current votes status
	router.get("/:id/votes", (req, res) => {
		let templateVars = {};
    checkIfExists(req.params.id).then((response) => {
      if (response) {
        knex("poll")
        .join("response", "poll.id", "=", "response.poll_id")
        .select("*")
        .where("poll.randomURL", req.params.id)
        .orderBy("borda", "desc")
        .then(function(table) {
          templateVars.responses = table;
          res.render("../views/vote.ejs", templateVars);
        });
      } else {
        templateVars = {errorCode: 404, errorMessage: "Cannot find poll"};
        res.render("./error.ejs", templateVars);
      }
    });

	});

	// Submit email address to soft-login and assign cookie
	router.put("/:id/login", (req, res) => {
		knex
			.select("*")
			.from("poll")
			.where("poll.randomURL", req.params.id)
			.then((response) => {
				if (req.body.email === response[0].creator_email) {
					req.session.email = req.body.email;
					res.redirect(`/polls/${req.params.id}/admin`);
				} else {
					let templateVars = {errorCode: 500, errorMessage: "Unauthorized"};
					res.render("./error.ejs", templateVars);
				}
			});
	});

  // Endpoint for thank you page
  router.get("/:id/thanks", (req, res) => {
    let templateVars = {};
    checkIfExists(req.params.id).then((response) => {
      if (response) {
        knex
        .select("*")
        .from("poll")
        .where("poll.randomURL", req.params.id)
        .then((result) => {
          templateVars.creator_name = result[0].creator_name;
          res.render("thank_you", templateVars);
        });
      } else {
        templateVars = {errorCode: 404, errorMessage: "Cannot find poll"};
        res.render("./error.ejs", templateVars);
      }
    });
  });

	// Searches for responses based on randomURL and if owner, checks if there are
	//   at least 3 responses, then delete if true, and sends error if false
	router.delete("/:id/:response", (req, res) => {
    knex
      .select("*")
      .from("poll")
      .where("poll.randomURL", req.params.id)
      .then((response) => {
        console.log(response[0].creator_email)
        console.log(response[0].creator_email)
        if (req.session.email === response[0].creator_email) {
          knex("response")
            .join("poll", "response.poll_id", "=", "poll.id")
        		.where("poll.randomURL", req.params.id)
            .count("*")
      			.then((response) => {
              if (response[0].count > 2) {
      					knex("response")
      						.where("id", req.body.id)
      						.del()
      						.then(function(){
                    res.status(200).json({message:'response deleted'})
      						});
      				} else {
                res.json({message:'need at least 2 options'})
      				}
    			  });
        } else {
          res.json({message:'unauthorized'})
        }
      });
	});

	return router;
};
