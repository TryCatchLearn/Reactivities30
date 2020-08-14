import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import queryString from 'query-string';
import { Segment, Header, Icon, Button } from 'semantic-ui-react';
import agent from '../../app/api/agent';
import { toast } from 'react-toastify';

const RegisterSuccess: React.FC<RouteComponentProps> = ({ location }) => {
  const { email } = queryString.parse(location.search);

  const handleConfirmEmailResend = () => {
    agent.User.resendVerifyEmailConfirm(email as string)
      .then(() => {
        toast.success('Verification email resent - please check your email');
      })
      .catch((error) => console.log(error));
  };

  return (
    <Segment placeholder>
      <Header icon>
        <Icon name='check' />
        Successfully registered!
      </Header>

      <Segment.Inline>
        <div className='center'>
          <p>
            Please check your email (including junk folder) for the verication
            email
          </p>
          {email && (
            <>
              <p>
                Didn't receive the email? Please click below button to resend
              </p>
              <Button
                onClick={handleConfirmEmailResend}
                primary
                content='Resend email'
                size='huge'
              />
            </>
          )}
        </div>
      </Segment.Inline>
    </Segment>
  );
};

export default RegisterSuccess;