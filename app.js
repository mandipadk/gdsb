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

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

// Store for in-progress games. In production, you'd want to use a DB
const activeGames = {};


app.get('/', function (req,res){
  res.send("The bot is alive. App ID = "+ process.env.APP_ID)
})

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/interactions', async function (req, res) {
  // Interaction type and data
  const { type, id, data } = req.body;

  //Handle verification requests
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "test" command
    if (name === 'test') {
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
      // Send a message with buttons
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
                  custom_id: 'answer_button',
                  label: 'Submit A Code',
                  style: ButtonStyleTypes.SUCCESS,
                },
                {
                  type: MessageComponentTypes.BUTTON,
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

  // Handle requests from interactive components
  if (type === InteractionType.MESSAGE_COMPONENT) {
    console.log('-----------------------------------')
    console.log('Data from Interaction with button')
    console.log('-----------------------------------')
    console.log(data)
    console.log('-----------------------------------')
    console.log('Data ends here')
    console.log('-----------------------------------')

    // custom_id set in payload when sending message component
    const componentId = data.custom_id;
    // user who clicked button
    const userId = req.body.member.user.id;

    if (componentId === 'answer_button') {
      // console.log("-------------------------------")
      // console.log("Popup Modal")
      // console.log("-------------------------------")
      // console.log(req.body);
      // console.log("-------------------------------")
      return res.send({
        type: InteractionResponseType.MODAL,
        data: {
          custom_id: 'answer_modal',
          title: 'Submit your code below',
          },
          components: [
            {
              // Text inputs must be inside of an action component
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.INPUT_TEXT,
                  custom_id: 'name_text',
                  style: 1,
                  label: 'Type some text',
                },
              ],
            },
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.INPUT_TEXT,
                  custom_id: 'answer_text',
                  // Bigger text box for answer input
                  style: 2,
                  label: 'Type some (longer) text',
                },
              ],
            },
          ],
        });
    };

    if (componentId === 'second_button') {
      // console.log(req.body);
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: `<@${userId}> clicked the button` },
      });
    }
  }

  if (type === InteractionType.MODAL_SUBMIT) {
      // custom_id of modal
      const modalId = data.custom_id;
      // user ID of member who filled out modal
      const userId = req.body.member.user.id;
  
      if (modalId === 'answer_modal') {
        let modalValues = '';
        // Get value of text inputs
        for (let action of data.components) {
          let inputComponent = action.components[0];
          modalValues += `${inputComponent.custom_id}: ${inputComponent.value}\n`;
        }
  
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `<@${userId}> typed the following (in a modal):\n\n${modalValues}`,
          },
        });
      }
    }
});


app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
