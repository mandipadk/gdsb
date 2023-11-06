import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';
import { VerifyDiscordRequest, getRandomEmoji, DiscordRequest } from './utils.js';
import { getShuffledOptions, getResult } from './game.js';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

// Store for in-progress games. In production, you'd want to use a DB
const activeGames = {};


app.get('/', function (req,res){
  res.send("The bot is alive. App ID= "+ process.env.APP_ID)
})

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/interactions', async function (req, res) {
  // Interaction type and data
  const { type, id, data } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "test" command
    if (name === 'test') {
      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content: 'hello world ' + getRandomEmoji(),
        },
      });
    }
  }

  if (type === InteractionType.APPLICATION_COMMAND) {
    // Slash command with name of "submit"
    if (data.name === 'submit') {
      // Send a message with a button
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'Submit your answers here, or ask a private question to admins:',
          // Buttons are inside of action rows
          components: [
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.BUTTON,
                  // Value for your app to identify the button
                  custom_id: 'my_button',
                  label: 'Submit A Code',
                  style: ButtonStyleTypes.SUCCESS,
                },
                {
                  type: MessageComponentTypes.BUTTON,
                  // Value for your app to identify the button
                  custom_id: 'second_button',
                  label: 'Ask a question',
                  style: ButtonStyleTypes.DANGER,
                },
              ],
            },
          ],
        },
      });
    }
  }

  /**
   * Handle requests from interactive components
   */
  if (type === InteractionType.MESSAGE_COMPONENT) {
    // custom_id set in payload when sending message component
    const componentId = data.custom_id;
    // user who clicked button
    const userId = req.body.member.user.id;

    if (componentId === 'my_button') {
      console.log("-------------------------------")
      console.log("Popup Modal")
      console.log("-------------------------------")
      console.log(req.body);
      console.log("-------------------------------")
      return res.send({
        type: InteractionResponseType.MODAL,
        data: {
          content: `<@${userId}> sent the answer!` },
          components: [{
            type: 4,
            custom_id: "answerInput",
            label: "Enter your multiline answer here",
            style: 2,
            min_length: 1,
            max_length: 4000,
            placeholder: "something here",
            required: true
          }]
       });
    };

    if (componentId === 'answerInput') {
      console.log(req.body);
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
           content: `<@${userId}> sent the answer!` },
           components: [
            {
              id: "1113294336206065845",
              guild_id: "901394188023787540",
              name: "general",
              type: 2,
              position: 6,
              permission_overwrites: [],
              rate_limit_per_user: 2,
              topic: req.body,
              default_auto_archive_duration: 60           
            }]
      });
    };
  }

});


app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
