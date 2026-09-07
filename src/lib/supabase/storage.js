function buildObjectPath(userId, file) {
  const safeName = file.name.replace(/[^\w.\-]+/g, "-");
  return `${userId}/${Date.now()}-${safeName}`;
}

export async function uploadAvatar(supabase, userId, file) {
  const path = buildObjectPath(userId, file);
  const { data, error } = await supabase.storage
    .from("avatars")
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
    });

  if (error) {
    return { data: null, error, publicUrl: null };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(data.path);

  return { data, error: null, publicUrl };
}

export async function uploadEventAttachment(supabase, userId, file) {
  const path = buildObjectPath(userId, file);
  const { data, error } = await supabase.storage
    .from("event-attachments")
    .upload(path, file, {
      contentType: file.type,
    });

  return { data, error };
}

export async function getEventAttachmentUrl(supabase, path) {
  const { data, error } = await supabase.storage
    .from("event-attachments")
    .createSignedUrl(path, 60 * 60);

  return { url: data?.signedUrl ?? null, error };
}
