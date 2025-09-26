import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const RatingEmailTemplate = () => {
  const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rate Our Service</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #2c3e50;">How did we do?</h1>
    <p>Hello {{customer_name}},</p>
    <p>Thank you for choosing us, we'd love your feedback. How was your experience today?</p>
    
    <div style="display: flex; flex-wrap: wrap; justify-content: space-between; margin-top: 20px;">
        <a href="https://hook.us2.make.com/e7y882vji5jldjxv2feklqhlckv949uq?rating=1&email={{customer_email}}" style="background-color: #FF4136; color: white; border: none; padding: 10px 15px; margin: 5px; font-size: 14px; text-decoration: none; border-radius: 5px; text-align: center; display: inline-block;">1 - Poor</a>
        <a href="https://hook.us2.make.com/e7y882vji5jldjxv2feklqhlckv949uq?rating=2&email={{customer_email}}" style="background-color: #FF851B; color: white; border: none; padding: 10px 15px; margin: 5px; font-size: 14px; text-decoration: none; border-radius: 5px; text-align: center; display: inline-block;">2 - Fair</a>
        <a href="https://hook.us2.make.com/e7y882vji5jldjxv2feklqhlckv949uq?rating=3&email={{customer_email}}" style="background-color: #FFDC00; color: black; border: none; padding: 10px 15px; margin: 5px; font-size: 14px; text-decoration: none; border-radius: 5px; text-align: center; display: inline-block;">3 - Good</a>
        <a href="https://hook.us2.make.com/e7y882vji5jldjxv2feklqhlckv949uq?rating=4&email={{customer_email}}" style="background-color: #2ECC40; color: white; border: none; padding: 10px 15px; margin: 5px; font-size: 14px; text-decoration: none; border-radius: 5px; text-align: center; display: inline-block;">4 - Great </a>
        <a href="https://hook.us2.make.com/e7y882vji5jldjxv2feklqhlckv949uq?rating=5&email={{customer_email}}" style="background-color: #0074D9; color: white; border: none; padding: 10px 15px; margin: 5px; font-size: 14px; text-decoration: none; border-radius: 5px; text-align: center; display: inline-block;">5 - Excellent</a>
    </div>
    
    <p>Your feedback helps us to be better.</p>
    <p>I appreciate you,</p>
    <p>Tenera holistic and Wellness Team</p>

    <table cellpadding="0" cellspacing="0" border="0" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;">
        <tbody>
            <tr>
                <td>
                    <table cellpadding="0" cellspacing="0" border="0" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;">
                        <tbody>
                            <tr>
                                <td style="vertical-align: top;">
                                    <table cellpadding="0" cellspacing="0" border="0" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;">
                                        <tbody>
                                            <tr>
                                                <td style="text-align: center;">
                                                    <img src="https://d1yei2z3i6k35z.cloudfront.net/8917555/67d291b5bb27a_Teneralogo2.png" role="presentation" width="130" style="display: block; max-width: 128px;">
                                                </td>
                                            </tr>
                                            <tr>
                                                <td height="30"></td>
                                            </tr>
                                            <tr>
                                                <td style="text-align: center;">
                                                    <table cellpadding="0" cellspacing="0" border="0" style="display: inline-block; vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;">
                                                        <tbody>
                                                            <tr style="text-align: center;">
                                                                <td>
                                                                    <a href="#" style="display: inline-block; padding: 0px; background-color: rgb(112, 117, 219);">
                                                                        <img src="https://cdn2.hubspot.net/hubfs/53/tools/email-signature-generator/icons/facebook-icon-2x.png" alt="facebook" width="24" style="background-color: rgb(112, 117, 219); max-width: 135px; display: block;">
                                                                    </a>
                                                                </td>
                                                                <td width="5">
                                                                    <div></div>
                                                                </td>
                                                                <td>
                                                                    <a href="#" style="display: inline-block; padding: 0px; background-color: rgb(112, 117, 219);">
                                                                        <img src="https://cdn2.hubspot.net/hubfs/53/tools/email-signature-generator/icons/twitter-icon-2x.png" alt="twitter" width="24" style="background-color: rgb(112, 117, 219); max-width: 135px; display: block;">
                                                                    </a>
                                                                </td>
                                                                <td width="5">
                                                                    <div></div>
                                                                </td>
                                                                <td>
                                                                    <a href="#" style="display: inline-block; padding: 0px; background-color: rgb(112, 117, 219);">
                                                                        <img src="https://cdn2.hubspot.net/hubfs/53/tools/email-signature-generator/icons/linkedin-icon-2x.png" alt="linkedin" width="24" style="background-color: rgb(112, 117, 219); max-width: 135px; display: block;">
                                                                    </a>
                                                                </td>
                                                                <td width="5">
                                                                    <div></div>
                                                                </td>
                                                                <td>
                                                                    <a href="#" style="display: inline-block; padding: 0px; background-color: rgb(112, 117, 219);">
                                                                        <img src="https://cdn2.hubspot.net/hubfs/53/tools/email-signature-generator/icons/instagram-icon-2x.png" alt="instagram" width="24" style="background-color: rgb(112, 117, 219); max-width: 135px; display: block;">
                                                                    </a>
                                                                </td>
                                                                <td width="5">
                                                                    <div></div>
                                                                </td>
                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                                <td width="46">
                                    <div></div>
                                </td>
                                <td style="padding: 0px; vertical-align: middle;">
                                    <h2 style="margin: 0px; font-size: 18px; color: rgb(0, 0, 0); font-weight: 600;">
                                        <span>Dr. Amaka</span>
                                        <span>&nbsp;</span>
                                        <span></span>
                                    </h2>
                                    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;">
                                        <tbody>
                                            <tr>
                                                <td height="30"></td>
                                            </tr>
                                            <tr>
                                                <td style="width: 100%; border-bottom: 1px solid rgb(164, 12, 63); border-left: none; display: block;"></td>
                                            </tr>
                                            <tr>
                                                <td height="30"></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <table cellpadding="0" cellspacing="0" border="0" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;">
                                        <tbody>
                                            <tr height="25" style="vertical-align: middle;">
                                                <td width="30" style="vertical-align: middle;">
                                                    <table cellpadding="0" cellspacing="0" border="0" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;">
                                                        <tbody>
                                                            <tr>
                                                                <td style="vertical-align: bottom;">
                                                                    <span style="display: inline-block; background-color: rgb(164, 12, 63);">
                                                                        <img src="https://cdn2.hubspot.net/hubfs/53/tools/email-signature-generator/icons/phone-icon-2x.png" alt="mobilePhone" width="13" style="display: block; background-color: rgb(164, 12, 63);">
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                                <td style="padding: 0px; color: rgb(0, 0, 0);">
                                                    <a href="tel:0777 777 7777 " style="text-decoration: none; color: rgb(0, 0, 0); font-size: 12px;">
                                                        <span>0777 777 7777 </span>
                                                    </a>
                                                </td>
                                            </tr>
                                            <tr height="25" style="vertical-align: middle;">
                                                <td width="30" style="vertical-align: middle;">
                                                    <table cellpadding="0" cellspacing="0" border="0" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;">
                                                        <tbody>
                                                            <tr>
                                                                <td style="vertical-align: bottom;">
                                                                    <span style="display: inline-block; background-color: rgb(164, 12, 63);">
                                                                        <img src="https://cdn2.hubspot.net/hubfs/53/tools/email-signature-generator/icons/link-icon-2x.png" alt="website" width="13" style="display: block; background-color: rgb(164, 12, 63);">
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                                <td style="padding: 0px;">
                                                    <a href="#" style="text-decoration: none; color: rgb(0, 0, 0); font-size: 12px;">
                                                        <span>tenerawellness.com</span>
                                                    </a>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <table cellpadding="0" cellspacing="0" border="0" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;">
                                        <tbody>
                                            <tr>
                                                <td height="30"></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>
</body>
</html>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(htmlTemplate);
  };

  return (
    <Card className="glass-card border-white/20">
      <CardHeader>
        <CardTitle className="text-white">Customer Rating Email Template</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-300">
          Use this template to request customer ratings after purchase. Replace placeholders:
        </p>
        <ul className="list-disc list-inside text-gray-300 space-y-1">
          <li><code>{`{{customer_name}}`}</code> - Customer's name</li>
          <li><code>{`{{customer_email}}`}</code> - Customer's email</li>
        </ul>
        <div className="flex gap-2">
          <Button onClick={copyToClipboard} className="glass-button">
            Copy Template
          </Button>
        </div>
        <div className="glass-secondary p-4 rounded-lg border border-white/20">
          <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap">
            {htmlTemplate}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};

export default RatingEmailTemplate;