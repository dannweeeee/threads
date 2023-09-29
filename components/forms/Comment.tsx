"use client"

import * as z from "zod";
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from '@hookform/resolvers/zod';

import { usePathname, useRouter } from 'next/navigation';

// import { updateUser } from '@/lib/actions/user.actions';
import { CommentValidation } from '@/lib/validations/thread';
import Image from "next/image";
// import { createThread } from "@/lib/actions/threads.actions";

interface Props {
    threadId: string;
    currentUserImg: string;
    currentUserId: string;
}

const Comment = ({ threadId, currentUserImg, currentUserId }: Props) => {
    const router = useRouter();
    const pathname = usePathname();

    const form = useForm({
        resolver: zodResolver(CommentValidation),
        defaultValues: {
            thread: ''
        }
    })

    const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
        // await createThread({
        //   text: values.thread, // this is the thread content that comes from onSubmit
        //   author: userId,
        //   communityId: null,
        //   path: pathname,
        // });
    
        router.push("/")
    }
    
    return(
        <Form {...form}>
        <form
          className="comment-form"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name='thread'
            render={({ field }) => (
              <FormItem className='flex w-full items-center gap-3'>
                <FormLabel>
                  <Image 
                    src={currentUserImg}
                    alt="Profile Image"
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                </FormLabel>
                <FormControl className='border-none bg-transparent'>
                  <Input type="text" placeholder="Comment..." className="no-focus text-light-1 outline-none" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type='submit' className='comment-form_btn'>
            Reply
          </Button>
        </form>
      </Form>
    )
}

export default Comment;