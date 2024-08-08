import express from "express";
import axios from "axios";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const { WEBHOOK_VERIFY_TOKEN, GRAPH_API_TOKEN, PORT } = process.env;

let score = 0;

const sendWhatsAppMessage = async (businessPhoneNumberId, data) => {
  try {
    const response = await axios({
      method: "POST",
      url: `https://graph.facebook.com/v20.0/${businessPhoneNumberId}/messages`,
      headers: {
        Authorization: `Bearer ${GRAPH_API_TOKEN}`,
      },
      data,
    });
    console.log("Response:", response.status);
    return response;
  } catch (error) {
    console.error("Error:", error.response.data);
    throw error;
  }
};
app.post("/webhook", async (req, res) => {
  const status = req.body?.entry?.[0]?.changes?.[0]?.value?.statuses?.[0]?.status;
  if(status)
  console.log("status", status);
  const field = req.body.entry[0].changes[0].field;
  if(field)
  console.log("field", field);
  const contacts = req.body?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.wa_id||
  req.body?.entry?.[0]?.changes?.[0]?.value?.statuses?.[0]?.recipient_id;
  console.log("contact",contacts)
  const messages = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if(messages)
  console.log("messages",messages)
  const businessPhoneNumberId = req.body.entry?.[0].changes?.[0]?.value?.metadata?.phone_number_id;
  if (messages !== undefined) console.log("messages", messages);

  if (!messages && field !== "messages") {
    return res.sendStatus(400);
  }

  if (!contacts) {
    console.error("Contacts (recipient ID) is undefined or missing");
    return res.sendStatus(400);
  }
  const payload=messages?.button?.payload
  if(payload)
  console.log("payload",payload)
  const messages_id=messages?.id
  if(messages_id)
  console.log("id",messages_id)
  try {
    if (payload=="Proceed") {
      const sent_res = await sendWhatsAppMessage(
        businessPhoneNumberId,
        {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: contacts,
          type: "interactive",
          interactive: {
            type: "button",
            body: { text: "Please rate your experience:\n" },
            action: {
              buttons: [
                {
                  type: "reply",
                  reply: {
                    id: "q1_rating_excellent",
                    title: "Excellent"
                  }
                },
                {
                  type: "reply",
                  reply: {
                    id: "q1_rating_average",
                    title: "Average"
                  }
                },
                {
                  type: "reply",
                  reply: {
                    id: "q1_rating_poor",
                    title: "Poor"
                  }
                }
              ]
            },
          },
        }
      );
      console.log("sent_res", sent_res.status);
     
    } 
    else if (messages?.interactive?.button_reply?.id.includes("q1")) {
      score += messages?.interactive?.button_reply?.id.includes("excellent") ? 1 : 0;
      await sendWhatsAppMessage(
        businessPhoneNumberId,
        {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: contacts,
          type: "interactive",
          interactive: {
            type: "button",
            body: { text: "How likely are you to recommend Greenwall Dental Clinic?\n" },
            action: {
              buttons: [
                {
                  type: "reply",
                  reply: {
                    id: "q2_rating_excellent",
                    title: "Excellent"
                  }
                },
                {
                  type: "reply",
                  reply: {
                    id: "q2_rating_average",
                    title: "Average"
                  }
                },
                {
                  type: "reply",
                  reply: {
                    id: "q2_rating_poor",
                    title: "Poor"
                  }
                }
              ]
            },
          },
        }
      );
    } 
    else if (messages?.interactive?.button_reply?.id.includes("q2")) {

      score += messages?.interactive?.button_reply?.id.includes("excellent") ? 1 : 0;
      await sendWhatsAppMessage(
        businessPhoneNumberId,
        {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: contacts,
          type: "interactive",
          interactive: {
            type: "button",
            body: { text: "How happy are you with your clinical results?\n" },
            action: {
              buttons: [
                {
                  type: "reply",
                  reply: {
                    id: "q3_rating_excellent",
                    title: "Very"
                  }
                },
                {
                  type: "reply",
                  reply: {
                    id: "q3_rating_average",
                    title: "Moderate"
                  }
                },
                {
                  type: "reply",
                  reply: {
                    id: "q3_rating_poor",
                    title: "Unhappy"
                  }
                }
              ]
            },
          },
        }
      );
    }
     else if (messages?.interactive?.button_reply?.id.includes("q3")) {

      score += messages?.interactive?.button_reply?.id.includes("excellent") ? 1 : 0;
      await sendWhatsAppMessage(
        businessPhoneNumberId,
        {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: contacts,
          type: "interactive",
          interactive: {
            type: "button",
            body: { text: "How happy are you with your clinical results?\n" },
            action: {
              buttons: [
                {
                  type: "reply",
                  reply: {
                    id: "q4_rating_excellent",
                    title: "Excellent"
                  }
                },
                {
                  type: "reply",
                  reply: {
                    id: "q4_rating_average",
                    title: "Average"
                  }
                },
                {
                  type: "reply",
                  reply: {
                    id: "q4_rating_poor",
                    title: "Poor"
                  }
                }
              ]
            },
          },
        }
      );
    } 
    else if (messages?.interactive?.button_reply?.id.includes("q4")) {

      score += messages?.interactive?.button_reply?.id.includes("excellent") ? 1 : 0;
      if (score >= 4) {
        await sendWhatsAppMessage(
          businessPhoneNumberId,
          {
            messaging_product: "whatsapp",
            to: contacts,
            type: "text",
            text: {
              body: `Thank you for providing your feedback! It helps us improve our service.\n\nPlease could you rate and review us on google. It helps us grow and continue to deliver impactful work.\nhttps://maps.app.goo.gl/G4Z55yho36w46Amt7?g_st=iw`
            }
          }
        );
        score = 0;
      } else {
        await sendWhatsAppMessage(
          businessPhoneNumberId,
          {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: contacts,
            type: "interactive",
            interactive: {
              type: "button",
              body: { text: "Was there anything we could have done to improve your experience?" },
              action: {
                buttons: [
                  {
                    type: "reply",
                    reply: {
                      id: "improve_experience_yes",
                      title: "Yes",
                    },
                  },
                  {
                    type: "reply",
                    reply: {
                      id: "improve_experience_no",
                      title: "No",
                    },
                  }
                ]
              },
            },
            context: { message_id: messages?.id },
          }
        );
      }
    } 
    else if (messages?.type === "interactive" && messages?.interactive?.button_reply?.id === "improve_experience_yes") {
      await sendWhatsAppMessage(
        businessPhoneNumberId,
        {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: contacts,
          type: "text",
          text: {
            body: "What could we do to make your experience ten times better?"
          },
          context: { message_id: messages?.id },
        }
      );
      score = 0;
    } 
    else if(messages_id && !payload){
      await sendWhatsAppMessage(
        businessPhoneNumberId,
        {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: contacts,
          type: "text",
          text: {
            body: "Thank you for providing feedback to us."
          },
          context: { message_id: messages?.id },
        }
      );
      score = 0;
    }

  } catch (error) {
    console.error("Error handling message:", error);
  }

  res.sendStatus(200);
});

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    res.status(200).send(challenge);
    console.log("Webhook verified successfully!");
  } else {
    res.sendStatus(403);
  }
});

app.get("/", (req, res) => {
  res.send(`
    <pre>
    Nothing to see here.
    Check out README.md to start.
    </pre>
  `);
});

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});