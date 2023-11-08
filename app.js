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
  // async(interaction) => {
    if (type === InteractionType.MESSAGE_COMPONENT) {
    console.log("-----------Data Start--------------")
    console.log(data)
    console.log("-----------Data End--------------")
    const componentId = data.custom_id;
    const userId = req.body.member.user.id;
    // await interaction.defer()

    if (componentId == 'answer_button') {
      // await interaction.defer();
      console.log("----------------Request Start--------------------")
      console.log(req)
      console.log("----------------Request End--------------------")
      try{
      return res.send({
        type: InteractionResponseType.MODAL,
        data: {
          custom_id: 'answer_modal',
          title: 'Submit your code below',  
          components: [
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.INPUT_TEXT,
                  custom_id: 'name_text',
                  style: 1,
                  label: 'Type your name here',
                },
              ],
            },
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.INPUT_TEXT,
                  custom_id: 'answer_text',
                  style: 2,
                  label: 'Type your answer here',
                },
              ],
            },
          ],
        }
        });
      }
      catch (error){
        // Handle the error
        console.log(error);
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Something went wrong while sending the modal: ' + error.message,
          },
        });
      }
    };

    if (componentId === 'second_button') {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: `<@${userId}> clicked the button` },
      });
    }
  }

  if (type === InteractionType.MODAL_SUBMIT) {
      const modalId = data.custom_id;
      const userId = req.body.member.user.id;
  
      if (modalId === 'answer_modal') {
        let modalValues = '';
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
