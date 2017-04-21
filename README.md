# Solium Project - A Serverless Application with Babel

### Local installation Development Dependencies

Node 7 or higher with npm: https://nodejs.org/en/download/

Older versions of Node may work after building with Babel

### Getting started locally

First, clone down the repo:
```
$ git clone https://github.com/maludwig/solium-project.git
```

From the project directory, run the following to pull down all dependencies:
```
$ npm install
```

Then build the project with babel to transpile it down to more compatible Javascript, a "lib" directory should
appear under the project directory:
```
$ npm run build
```

When you are doing development, you should use this command to make Babel watch your "src" directory for changes and
automatically transpile them to something more compatible.
```
$ npm run watch
```

The unit tests should now pass:
```
$ npm test
```

---

### Serverless Development Dependencies

Python 3 (latest) with pip: https://www.python.org/downloads/

Node 7 or higher with npm: https://nodejs.org/en/download/

### Getting Started with Serverless

First, you'll need to sign up for an Amazon Web Services (AWS) account, which will require a credit card:
https://aws.amazon.com/free/

Once you have that, you'll need to set up a User in IAM, with enough permissions to create all your resources, for
simplicity, you can give the account the AdministratorAccess Policy to give it everything it could ever need, but
be aware of the security ramifications here, a User that has AdministratorAccess has the power to do almost
anything to your account. When creating this User, select the option to create Access Keys. Write the Key and Secret
down, you'll need them later. These keys from the authentication framework, so be sure that you keep them secret
and safe. This example uses the username of "blankservice".

Install the AWS CLI to configure your profile by following this document:
http://docs.aws.amazon.com/cli/latest/userguide/installing.html

Run this to setup the profile (optionally use the username you selected earlier, instead of "blankservice"). Paste the
Key ID, then the Secret, the final two fields are optional, you can hit enter to skip past them:
```
$ aws configure --profile blankservice
```

You can type "aws sts get-caller-identity" to confirm that your credentials are accurate, the output should be similar to the following:
```
$ aws sts get-caller-identity
{
    "Account": "987653851234",
    "UserId": "AIDAITWIMSOIVFCW5CU9O",
    "Arn": "arn:aws:iam::987653851234:user/blankservice"
}
```

If you replaced "blankservice" above, you'll need to change the "profile" in serverless.yml to reflect this change.

From the project directory, run the following to pull down all dependencies:
```
$ npm install
```

Then build the project with babel to transpile it down to more compatible Javascript, a "lib" directory should
appear under the project directory:
```
$ npm run build
```

When you are doing development, you should use this command to make Babel watch your "src" directory for changes and
automatically transpile them to something more compatible.
```
$ npm run watch
```

The unit tests should now pass:
```
$ npm test
```

You will need Serverless if you want to publish this to AWS, this command installs it globally:
```
$ npm install -g serverless
```

To actually deploy your app, simply run this:
```
$ serverless deploy -v
```

Now you can make sure it all fits together nicely! Wander yourself into src/integration/endpoints.test.js, and set the 
SERVICE_ENDPOINT to the value output by the deploy command, and run the integration tests to actually hit the new
HTTPS endpoints hosted by AWS:
```
$ npm run test-integration
```

Or run all tests:
```
$ npm run test-all
```