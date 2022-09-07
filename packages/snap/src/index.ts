import { OnRpcRequestHandler } from '@metamask/snap-types';

/**
 * Get a message from the origin. For demonstration purposes only.
 *
 * @param originString - The origin string.
 * @returns A message based on the origin.
 */
export const getMessage = (originString: string): string =>
  `Hello, ${originString}!`;

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns `null` if the request succeeded.
 * @throws If the request method is not valid for this snap.
 * @throws If the `snap_confirm` call failed.
 */

/**
 *
 * @param newState
 */
type SnapState = {
  wins: number;
  losses: number;
};

/**
 *
 * @param newState
 */
async function saveState(newState: SnapState) {
  await wallet.request({
    method: 'snap_manageState',
    params: ['update', { ...newState }],
  });
}

/**
 *
 */
async function getState(): Promise<SnapState> {
  const state =
    ((await wallet.request({
      method: 'snap_manageState',
      params: ['get'],
    })) as SnapState) || undefined;
  if (!state) {
    return { wins: 0, losses: 0 };
  }
  return state;
}

const CSRNG_URL = 'https://csrng.net/csrng/csrng.php?min=0&max=1000';
const getRandomNum = async () => {
  const csrngResponse = await fetch(CSRNG_URL, {
    method: 'GET',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await csrngResponse.json();
  return data[0].random;
};

export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  const state = await getState();

  switch (request.method) {
    case 'hello':
      return wallet.request({
        method: 'snap_confirm',
        params: [
          {
            prompt: getMessage(origin),
            description:
              'This custom confirmation is just for display purposes.',
            textAreaContent:
              'But you can edit the snap source code to make it do something, if you want to!',
          },
        ],
      });

    case 'get_number':
      const randomVal = await getRandomNum();
      return {
        randomVal,
      };

    case 'guess':
      const { inputNum, guess } = request.params as {
        inputNum: number;
        guess: 'HI' | 'LO';
      };
      const randomNum = await getRandomNum();
      let success = false;
      let newState = state;

      if (
        (guess === 'HI' && inputNum < randomNum) ||
        (guess === 'LO' && inputNum > randomNum)
      ) {
        success = true;
        newState = { ...state, wins: state.wins + 1 };
      } else {
        newState = { ...state, losses: state.losses + 1 };
      }
      await saveState(newState);

      return {
        success,
        guess,
        inputNum,
        randomNum,
        newState,
      };
    case 'get_scores':
      return { state };

    default:
      throw new Error('Method not found.');
  }
};
