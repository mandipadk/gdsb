import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';

// Simple test command
const TEST_COMMAND = {
  name: 'test',
  description: 'Basic command',
  // type: 1,
};

const SUBMIT_COMMAND = {
  name: 'submit',
  description: 'Basic command to submit answers',
  // type: 3,
};

const ALL_COMMANDS = [TEST_COMMAND, SUBMIT_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);