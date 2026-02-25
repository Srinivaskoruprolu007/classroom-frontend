import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { CreateView } from "@/components/refine-ui/views/create-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  ALLOWED_TYPES,
  CLOUDINARY_UPLOAD_PRESET,
  CLOUDINARY_UPLOAD_URL,
  MAX_FILE_SIZE,
  subjects,
  teachers,
} from "@/constants";
import { classSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useBack } from "@refinedev/core";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

type ClassFormValues = z.infer<typeof classSchema>;

const CreateClass = () => {
  const back = useBack();
  const [bannerUploadError, setBannerUploadError] = useState("");
  const [bannerUploading, setBannerUploading] = useState(false);

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: "",
      description: "",
      subjectId: 0,
      teacherId: "",
      capacity: 30,
      status: "active",
      bannerUrl: "",
      bannerCldPubId: "",
      inviteCode: "",
      schedules: [],
    },
  });

  const onSubmit = (values: ClassFormValues) => {
    try {
      console.log("Form values:", values);
    } catch (error) {
      console.error("Error creating class:", error);
    }
  };

  const bannerUrl = form.watch("bannerUrl");
  const bannerPublicId = form.watch("bannerCldPubId");

  const onBannerChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setBannerUploadError("");

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setBannerUploadError("Only PNG, JPG, JPEG, and WEBP files are allowed.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setBannerUploadError("Banner image must be 3MB or less.");
      return;
    }

    try {
      setBannerUploading(true);
      const payload = new FormData();
      payload.append("file", file);
      payload.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = (await response.json()) as {
        secure_url?: string;
        public_id?: string;
      };

      if (!result.secure_url || !result.public_id) {
        throw new Error("Invalid upload response");
      }

      form.setValue("bannerUrl", result.secure_url, { shouldValidate: true });
      form.setValue("bannerCldPubId", result.public_id, {
        shouldValidate: true,
      });
    } catch {
      setBannerUploadError("Failed to upload banner image. Try again.");
    } finally {
      setBannerUploading(false);
      event.target.value = "";
    }
  };

  return (
    <CreateView className="create-class-page">
      <Breadcrumb />
      <h1 className="create-class-title">Create a Class</h1>
      <div className="create-class-intro">
        <p>Provide the required information to create a new class.</p>
        <Button type="button" variant="outline" onClick={back}>
          Go Back
        </Button>
      </div>
      <Separator className="my-4" />
      <Card className="create-class-card">
        <CardHeader>
          <CardTitle>Fill the form</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent>
          <Form {...form}>
            <form
              className="create-class-form"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className="create-class-section">
                <h3 className="create-class-section-title">Class Details</h3>
                <p className="create-class-section-subtitle">
                  Add basic information for your new class.
                </p>
              </div>

              <FormField
                control={form.control}
                name="bannerUrl"
                render={() => (
                  <FormItem>
                    <FormLabel>Banner Image</FormLabel>
                    <FormControl>
                      <div className="create-class-banner-upload">
                        <Input
                          type="file"
                          accept={ALLOWED_TYPES.join(",")}
                          onChange={onBannerChange}
                          disabled={bannerUploading}
                        />
                        <p className="create-class-banner-help">
                          PNG/JPG/JPEG/WEBP, max 3MB.
                        </p>
                        {bannerUploading && (
                          <p className="create-class-banner-help">
                            Uploading banner...
                          </p>
                        )}
                        {bannerUploadError && (
                          <p className="create-class-banner-error">
                            {bannerUploadError}
                          </p>
                        )}
                        {bannerUrl && (
                          <img
                            src={bannerUrl}
                            alt="Class banner preview"
                            className="create-class-banner-preview"
                          />
                        )}
                        {bannerPublicId && (
                          <p className="create-class-banner-help">
                            Uploaded: {bannerPublicId}
                          </p>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="create-class-form-grid">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: CS Fundamentals A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="30"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subjectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value ? String(field.value) : undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem
                              key={subject.id}
                              value={String(subject.id)}
                            >
                              {subject.name} ({subject.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="teacherId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teacher</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select teacher" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {teachers.map((teacher) => (
                            <SelectItem key={teacher.id} value={teacher.id}>
                              {teacher.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="inviteCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invite Code (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: CSA-2026" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add a short description for the class"
                        className="min-h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bannerCldPubId"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="hidden"
                        className="create-class-hidden-input"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="create-class-form-actions">
                <Button type="button" variant="outline" onClick={back}>
                  Cancel
                </Button>
                <Button type="submit">Create Class</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </CreateView>
  );
};

export default CreateClass;
