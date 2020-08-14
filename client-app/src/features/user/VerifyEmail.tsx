import React, { useContext, useState, useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { RootStoreContext } from '../../app/stores/rootStore';
import queryString from 'query-string';
import agent from '../../app/api/agent';
import { Button, Segment, Header, Icon } from 'semantic-ui-react';
import LoginForm from './LoginForm';
import { toast } from 'react-toastify';

const VerifyEmail: React.FC<RouteComponentProps> = ({ location }) => {
  const rootStore = useContext(RootStoreContext);
  const Status = {
    Verifying: 'Verifying',
    Failed: 'Failed',
    Success: 'Success',
  };

  const [status, setStatus] = useState(Status.Verifying);
  const { openModal } = rootStore.modalStore;
  const { token, email } = queryString.parse(location.search);

  useEffect(() => {
    agent.User.verifyEmail(token as string, email as string)
      .then(() => {
        setStatus(Status.Success);
      })
      .catch(() => {
        setStatus(Status.Failed);
      });
  }, [Status.Failed, Status.Success, token, email]);

  const handleConfirmEmailResend = () => {
    agent.User.resendVerifyEmailConfirm(email as string)
      .then(() => {
        toast.success('Verification email resent - please check your email');
      })
      .catch((error) => console.log(error));
  };

  const getBody = () => {
    switch (status) {
      case Status.Verifying:
        return <p>Verifying...</p>;
      case Status.Failed:
        return (
          <div className='center'>
            <p>
              Verication failed - you can try resending the verification email
            </p>
            <Button onClick={handleConfirmEmailResend} primary size='huge' content='Resend email' />
          </div>
        );
      case Status.Success:
        return (
          <div className='center'>
            <p>Email has been verified - you can now login</p>
            <Button
              primary
              onClick={() => openModal(<LoginForm />)}
              size='large'
              content='Login'
            />
          </div>
        );
    }

  };
  return (
    <Segment placeholder>
        <Header icon>
            <Icon name='envelope' />
            Email verification
        </Header>

        <Segment.Inline>
            {getBody()}
        </Segment.Inline>
    </Segment>
)
};

export default VerifyEmail