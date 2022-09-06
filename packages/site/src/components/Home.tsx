import { useContext, useState } from 'react';
import styled from 'styled-components';
import { MetamaskActions, MetaMaskContext } from '../hooks';
import { connectSnap, isSnapInstalled, sendHello } from '../utils';
import { defaultSnapOrigin } from '../config';
import { Button, ConnectButton, InstallFlaskButton } from './Buttons';
import { Card } from './Card';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-top: 7.6rem;
  margin-bottom: 7.6rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;

const Heading = styled.h1`
  margin-top: 0;
  margin-bottom: 2.4rem;
  text-align: center;
`;

const Span = styled.span`
  color: ${(props) => props.theme.colors.primary.default};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 0;
  ${({ theme }) => theme.mediaQueries.small} {
    font-size: ${({ theme }) => theme.fontSizes.text};
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 64.8rem;
  width: 100%;
  height: 100%;
  margin-top: 1.5rem;
`;

const Notice = styled.div`
  background-color: ${({ theme }) => theme.colors.background.alternative};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;

  & > * {
    margin: 0;
  }
  ${({ theme }) => theme.mediaQueries.small} {
    margin-top: 1.2rem;
    padding: 1.6rem;
  }
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error.muted};
  border: 1px solid ${({ theme }) => theme.colors.error.default};
  color: ${({ theme }) => theme.colors.error.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;
  ${({ theme }) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-bottom: 1.2rem;
    margin-top: 1.2rem;
    max-width: 100%;
  }
`;

export const Home = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [num, setNum] = useState<number|undefined>();
  const CSRNG_URL = 'https://csrng.net/csrng/csrng.php?min=1&max=1000';


  const handleConnectClick = async () => {


    try {
      await connectSnap();
      const snapInstalled = await isSnapInstalled();

      dispatch({
        type: MetamaskActions.SetInstalled,
        payload: snapInstalled,
      });
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleGuessClick = async (guess: 'HI' | 'LO') => {
    try {
      const response: Partial<{ success:boolean, randomNum: number }> | null | undefined = await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: [
          defaultSnapOrigin,
          {
            method: 'guess',
            params: {
              guess,
              inputNum: num
            }
          },
        ],
      });
      console.log(response);
      setNum(response?.randomNum)
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleGetNumberClick = async () => {
    try {
      const response: Partial<{ randomVal: number }> | null | undefined = await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: [
          defaultSnapOrigin,
          {
            method: 'get_number',
          },
        ],
      });
      console.log(response);
      setNum(response?.randomVal)
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  return (
    <Container>
      <Heading>
        Welcome to <Span>template-snap</Span>
      </Heading>
      <Subtitle>
        Get started by editing <code>src/index.ts</code>
      </Subtitle>
      <CardContainer>
        {state.error && (
          <ErrorMessage>
            <b>An error happened:</b> {state.error.message}
          </ErrorMessage>
        )}
        {!state.isFlask && (
          <Card
            content={{
              title: 'Install',
              description:
                'Snaps is pre-release software only available in MetaMask Flask, a canary distribution for developers with access to upcoming features.',
              button: <InstallFlaskButton />,
            }}
            fullWidth
          />
        )}
        {!state.isSnapInstalled && (
          <Card
            content={{
              title: 'Connect',
              description:
                'Get started by connecting to and installing the example snap.',
              button: (
                <ConnectButton
                  onClick={handleConnectClick}
                  disabled={!state.isFlask}
                />
              ),
            }}
            disabled={!state.isFlask}
          />
        )}
        <Card
          content={{
            title: 'Get number to guess',
            description: '',
            button: (
              <Button
                onClick={handleGetNumberClick}
                disabled={!state.isSnapInstalled}
              >
                Get a number
              </Button>
            ),
          }}
          disabled={!state.isSnapInstalled}
          fullWidth={state.isFlask && state.isSnapInstalled}
        />
        <div>
          {num && <div>
            {num}
            <Button
              onClick={() => {
              handleGuessClick('HI')}
              }
              disabled={!state.isSnapInstalled}
            >
              Guess HI
            </Button>
            <Button
              onClick={() => {
                handleGuessClick('LO')}
              }
              disabled={!state.isSnapInstalled}
            >
              Guess LO
            </Button>
          </div>}
        </div>
        <Notice>
          <p>
            Please note that the <b>snap.manifest.json</b> and{' '}
            <b>package.json</b> must be located in the server root directory and
            the bundle must be hosted at the location specified by the location
            field.
          </p>
        </Notice>
      </CardContainer>
    </Container>
  );
};
