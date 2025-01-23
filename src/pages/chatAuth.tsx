import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export function ChatAuth({ isDialogOpen = false }: { isDialogOpen: boolean }) {
  return (
    <Dialog open={isDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Passcode for new chat</DialogTitle>
          <DialogDescription>
            This is a one time passcode you need to set that is used to uniquely
            encrypt the chat you will have with this client, please do not
            forget this code as there is no recovery option
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center items-center space-x-2"> 
            <InputOTP maxLength={6}>
              <InputOTPGroup className="shadow-md">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP> 
        </div>
        <DialogFooter className="sm:justify-center flex gap-4"> 
            <div>
              <Button type="button" variant="secondary" onClick={()=>{isDialogOpen=false}}>
                Close
              </Button>
              <Button type="button" variant="default" className="ml-4">
                Save
              </Button>
            </div> 
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
