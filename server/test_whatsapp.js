import { PeriskopeApi } from "@periskope/periskope-client";

const client = new PeriskopeApi({
  authToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCIgOiAiNzM4MjViMTgtNTBjYi00NWFkLWJiNGYtMzRmMDJjZTdhOTI5IiwgInJvbGUiIDogImFwaSIsICJ0eXBlIiA6ICJhcGkiLCAibmFtZSIgOiAiVGVzdF9tb2RlIiwgImV4cCIgOiAyMDgwODAxNjcyLCAiaWF0IiA6IDE3NjUyNjg4NzIsICJzdWIiIDogImYzODZhZjVhLTIzYTMtNDQxYy04MGMxLWExYTdmMzNmOWNhMiIsICJpc3MiIDogInBlcmlza29wZS5hcHAiLCAibWV0YWRhdGEiIDoge319.W8pHj8M8673AvmbUsXFkQpwBZVgBAc4pDMItfuOG5Bo',
  phone: '918870180050' // this must be the Periskope-registered number
});

async function sendMessage() {
  try {
    const response = await client.message.send({
      chat_id: '918220318626',   // e.g. "919876543210"
      message: "Hello from Periskope"
    });

    console.log('Message sent:', response);
  } catch (error) {
    console.error('Failed to send message:', error);
  }
}

sendMessage();
