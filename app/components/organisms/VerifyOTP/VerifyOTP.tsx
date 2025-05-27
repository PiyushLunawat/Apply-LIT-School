import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@remix-run/react";
import { auth } from "firebase.client";
import { PhoneAuthProvider, signInWithCredential } from "firebase/auth";
import Cookies from "js-cookie";
import { MailIcon, Phone } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { resendOtp, verifyOtp } from "~/api/authAPI";
import { getCurrentStudent } from "~/api/studentAPI";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { Label } from "~/components/ui/label";
import { UserContext } from "~/context/UserContext";
import { useFirebaseAuth } from "~/hooks/use-firebase-auth";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../../ui/input-otp";

const formSchema = z.object({
  otp: z
    .string()
    .length(6, { message: "OTP must be 6 digits" })
    .regex(/^\d+$/, { message: "OTP must contain only numbers" }),
});

type FormValues = z.infer<typeof formSchema>;
interface VerifyOTPProps {
  verificationType: "contact" | "email";
  contactInfo: string;
  errorMessage?: string;
  setIsDialogOpen?: (isOpen: boolean) => void;
  onVerificationSuccess?: () => void;
  verificationId?: string;
  back?: string;
}

export const VerifyOTP: React.FC<VerifyOTPProps> = ({
  verificationType,
  contactInfo,
  setIsDialogOpen,
  verificationId,
  back,
}) => {
  const navigate = useNavigate();
  const [timer, setTimer] = useState(59);
  const [resendError, setResendError] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const { studentData, setStudentData } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const { initializeRecaptcha } = useFirebaseAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: "",
    },
  });

  const {
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { otp: "" },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      if (verificationType === "email") {
        const res = await verifyOtp({ email: contactInfo, otp: data.otp });
        Cookies.set("user-token", res.token, { expires: 4 });
        // Store studentData in localStorage
        if (res.studentData) {
          localStorage.setItem("studentData", JSON.stringify(res.studentData));
          const storedData = localStorage.getItem("studentData");
          if (storedData) {
            setStudentData(JSON.parse(storedData));
          }
        }
        if (res.studentData?.litmusTestDetails[0]?.litmusTaskId !== undefined) {
          navigate("../dashboard");
        } else if (res.studentData?.applicationDetails !== undefined) {
          console.log("navigating");
          console.log("studentData?._id:", studentData?._id);
          const res = await getCurrentStudent(studentData?._id);
          console.log(
            " student data:",
            res.data?.applicationDetails?.applicationStatus
          );
          if (
            res.data?.applicationDetails?.applicationStatus !== "initiated" &&
            res.data?.applicationDetails?.applicationStatus !== undefined
          ) {
            navigate("/application/status");
          } else navigate("../application");
        } else {
          navigate("../application");
        }
      }

      if (verificationType === "contact" && verificationId) {
        // const fullOtp = otp.join('');
        console.log("otp", data.otp);
        console.log("verificationId", verificationId);

        const credential = PhoneAuthProvider.credential(
          verificationId,
          data.otp
        );
        try {
          const data = await signInWithCredential(auth, credential);
          // setIsVerified(true);
          console.log(data.user.phoneNumber, "dtaa");

          if (studentData) {
            setStudentData({
              ...studentData,
              isMobileVerified: true,
              mobileNumber: contactInfo,
            });
          }

          if (setIsDialogOpen) {
            setIsDialogOpen(false);
          }
        } catch (error) {
          console.error("Error verifying OTP:", error);
        }

        // if (res?.data) {
        //   localStorage.setItem('studentData', JSON.stringify(res.data));
        //   setStudentData(res.data);
        //   if (setIsDialogOpen) { // Ensure it's defined
        //     setIsDialogOpen(false);
        //   }
        //   console.log('Mobile number verified successfully.');
        // }
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
      setVerifyError(
        "OTP verification failed. Please check your OTP and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    initializeRecaptcha("recaptcha-container");

    try {
      setLoading(true);

      await resendOtp({ email: contactInfo });
      setTimer(60);
      setResendError(null);
    } catch (error) {
      console.error("Resend OTP failed:", error);
      setResendError("Failed to resend OTP. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-6 mt-8 sm:mt-14 justify-center items-center">
      <div className="flex flex-col gap-6 sm:gap-8 w-full max-w-[840px] bg-[#1C1C1C] p-8 rounded-3xl mx-auto">
        <div className="flex justify-center">
          <img
            src="/assets/images/otp-verify-icon.svg"
            alt="Verify OTP"
            className=""
          />
        </div>

        {/* Header */}
        <div className="flex flex-col gap-4 text-center text-2xl font-semibold mb-2">
          {verificationType === "contact"
            ? "Verify Your Contact No."
            : "Verify Your Account"}
          <div className="text-center text-base">
            {verificationType === "contact" ? (
              <div className="sm:w-fit sm:flex text-center mx-auto">
                <span className="font-light sm:font-normal">
                  An OTP was sent to your contact no.
                </span>
                <span className="flex text-center font-light sm:font-normal mx-auto w-fit items-center">
                  <Phone className="w-4 h-4 ml-2 mr-1" /> {contactInfo}
                </span>
              </div>
            ) : (
              <div className="sm:w-fit sm:flex text-center mx-auto">
                <span className="font-light sm:font-normal">
                  An OTP was sent to your email
                </span>
                <span className="flex text-center font-light sm:font-normal mx-auto w-fit items-center">
                  <MailIcon className="w-4 h-4 ml-2 mr-1" /> {contactInfo}
                </span>
              </div>
            )}
          </div>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col items-center"
          >
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e); // React Hook Form's internal handler
                        setResendError(null); // Clear resend error
                        setVerifyError(null); // Clear verification error
                      }}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSeparator />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(resendError || verifyError) && (
              <Label
                htmlFor="contact-error"
                className="flex gap-1 items-center text-sm justify-start text-[#FF503D] font-normal mt-2"
              >
                {/* <AlertCircle className='w-3 h-3'/> */}
                {resendError || verifyError}
              </Label>
            )}

            {errors.otp && (
              <Label className="text-sm text-red-500 mt-2">
                {errors.otp.message}
              </Label>
            )}

            <div className="text-center mt-8">
              <Button size="xl" type="submit" disabled={loading}>
                {loading
                  ? "..."
                  : verificationType === "contact"
                  ? "Verify and Login"
                  : "Confirm and Login"}
              </Button>
            </div>
          </form>
        </Form>

        <div className="flex gap-2 text-center items-center text-base mx-auto">
          <Button
            variant="link"
            onClick={handleResendOtp}
            disabled={loading || timer > 0}
          >
            {loading ? "Resending OTP..." : "Resend OTP"}
          </Button>
          {timer > 0 ? `in 00:${timer < 10 ? `0${timer}` : timer}` : ""}
        </div>
      </div>

      {verificationType === "email" &&
        (back === "login" ? (
          <div className="text-center my-8">
            <a
              href={"/auth/login"}
              className="text-base font-medium text-white hover:underline"
            >
              {"← Login"}
            </a>
          </div>
        ) : (
          <div className="text-center my-8">
            <a
              href={"/auth/sign-up"}
              className="text-base font-medium text-white hover:underline"
            >
              {"← Register"}
            </a>
          </div>
        ))}
    </div>
  );
};

export default VerifyOTP;
