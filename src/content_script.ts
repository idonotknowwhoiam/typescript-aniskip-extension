import { browser, Runtime } from 'webextension-polyfill-ts';
import Message from './types/message_type';
import AniskipHttpClient from './api/aniskip_http_client';
import getPage from './utils/page_utils';
import { SkipOptionType } from './types/options/skip_option_type';
import { SkipType } from './types/api/skip_time_types';

/**
 * Returns the MAL id, episode number and provider name
 */
const getEpisodeInformation = async () => {
  const { pathname, hostname } = window.location;
  const page = getPage(pathname, hostname);

  const providerName = page.getProviderName();
  const episodeNumber = await page.getEpisodeNumber();
  const malId = await page.getMalId();

  return {
    malId,
    episodeNumber,
    providerName,
  };
};

/**
 * Adds the skip time to the player
 * @param aniskipHttpClient AniskipHttpClient object
 * @param malId MAL idenfitication number
 * @param episodeNumber Episode number
 * @param type Type of time to add, either 'op' or 'ed'
 */
const addSkipTime = async (
  aniskipHttpClient: AniskipHttpClient,
  malId: number,
  episodeNumber: number,
  type: SkipType,
  option: SkipOptionType
) => {
  if (option === 'disabled') {
    return;
  }
  const skipTimesResponse = await aniskipHttpClient.getSkipTimes(
    malId,
    episodeNumber,
    type
  );
  if (skipTimesResponse.found) {
    browser.runtime.sendMessage({
      type: `player-add-${option}-time`,
      payload: skipTimesResponse.result,
    });
  }
};

/**
 * Adds the opening and ending skip invervals
 */
const initialiseSkipTimes = async () => {
  const aniskipHttpClient = new AniskipHttpClient();
  const { malId, episodeNumber } = await getEpisodeInformation();
  const { openingOption, endingOption } = await browser.storage.sync.get([
    'openingOption',
    'endingOption',
  ]);
  addSkipTime(aniskipHttpClient, malId, episodeNumber, 'op', openingOption);
  addSkipTime(aniskipHttpClient, malId, episodeNumber, 'ed', endingOption);
};

/**
 * Handles messages between the player and the background script
 * @param message Message containing the type of action and the payload
 * @param _sender Sender of the message
 */
const messageHandler = (message: Message, _sender: Runtime.MessageSender) => {
  switch (message.type) {
    case 'player-ready': {
      initialiseSkipTimes();
      break;
    }
    case 'get-episode-information': {
      getEpisodeInformation()
        .then((episodeInformation) => ({
          type: `${message.type}-response`,
          payload: episodeInformation,
        }))
        .then((response) => browser.runtime.sendMessage(response));
      break;
    }
    default:
  }
};

browser.runtime.onMessage.addListener(messageHandler);
