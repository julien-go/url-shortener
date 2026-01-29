import "dotenv/config";
import { signToken } from "../modules/auth/auth.service";

const token = signToken({
  sub: "d300a57a-d20a-4874-8f3d-83af95502e99",
  email: "test@mail.com",
});

console.log(token);
