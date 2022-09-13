import { OnRpcRequestHandler } from '@metamask/snap-types';

const CSRNG_URL = 'https://csrng.net/csrng/csrng.php?min=0&max=1000';

export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  switch (request.method) {
    case 'get_number':
      return {};

    case 'guess':
      return {};
    case 'get_scores':
      return {};

    default:
      throw new Error('Method not found.');
  }
};
