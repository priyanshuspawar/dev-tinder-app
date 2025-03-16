import { title } from "@/components/primitives";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";

export default function DocsPage() {
  const birthString = "2003-10-07";
  const schema = z.object({
    cart: z
      .array(
        z.object({
          id: z.string(),
          label: z.string(),
        })
      )
      .default([]),
    // .refine((v) => false, { message: "not valid" }),
  });
  const { control, handleSubmit } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });
  useFieldArray({
    control,
    name: "cart",
  });
  const onSubmit = (d: any) => {
    console.log("heyy", d);
  };

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-lg text-center justify-center">
        <h1 className={title()}>About</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <button type="submit" className="my-4">
            sub
          </button>
        </form>
      </div>
    </section>
  );
}
