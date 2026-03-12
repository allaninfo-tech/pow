// Reusable Firebase Storage upload utilities.
// All heavy media (avatars, screenshots, squad logos, challenge banners)
// go through these helpers so the rest of the codebase just calls one function.

import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

export type UploadProgressCallback = (progress: number) => void;

/**
 * Upload any file to Firebase Storage.
 *
 * @param file        The File object from an <input type="file">
 * @param path        Storage path, e.g. "avatars/{userId}/profile.webp"
 * @param onProgress  Optional callback receiving upload % (0–100)
 * @returns           The public Firebase download URL
 */
export function uploadFile(
    file: File,
    path: string,
    onProgress?: UploadProgressCallback
): Promise<string> {
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, path);
        const task = uploadBytesResumable(storageRef, file, {
            contentType: file.type,
        });

        task.on(
            'state_changed',
            (snapshot) => {
                const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                onProgress?.(pct);
            },
            (error) => reject(error),
            async () => {
                const url = await getDownloadURL(task.snapshot.ref);
                resolve(url);
            }
        );
    });
}

/**
 * Upload a user avatar.
 * Automatically resizes the path to be unique per user.
 *
 * @param file    The image file selected by the user
 * @param userId  Supabase user ID
 * @param onProgress  Optional progress callback
 * @returns       Firebase public download URL
 */
export async function uploadAvatar(
    file: File,
    userId: string,
    onProgress?: UploadProgressCallback
): Promise<string> {
    // Use timestamp to bust cached old avatars
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `avatars/${userId}/profile_${Date.now()}.${ext}`;
    return uploadFile(file, path, onProgress);
}

/**
 * Upload a submission screenshot.
 *
 * @param file          The screenshot image file
 * @param userId        Supabase user ID
 * @param submissionId  Supabase submission ID (or 'new' if not created yet)
 * @param onProgress    Optional progress callback
 * @returns             Firebase public download URL
 */
export async function uploadSubmissionScreenshot(
    file: File,
    userId: string,
    submissionId: string,
    onProgress?: UploadProgressCallback
): Promise<string> {
    const ext = file.name.split('.').pop() || 'png';
    const path = `submissions/${userId}/${submissionId}_${Date.now()}.${ext}`;
    return uploadFile(file, path, onProgress);
}

/**
 * Upload a challenge banner image (admin use).
 *
 * @param file         The banner image file
 * @param challengeId  Supabase challenge ID
 * @param onProgress   Optional progress callback
 * @returns            Firebase public download URL
 */
export async function uploadChallengeBanner(
    file: File,
    challengeId: string,
    onProgress?: UploadProgressCallback
): Promise<string> {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `challenges/${challengeId}/banner_${Date.now()}.${ext}`;
    return uploadFile(file, path, onProgress);
}

/**
 * Upload a squad logo or banner.
 *
 * @param file     The image file
 * @param squadId  Supabase squad ID
 * @param type     'logo' or 'banner'
 * @param onProgress  Optional progress callback
 * @returns        Firebase public download URL
 */
export async function uploadSquadImage(
    file: File,
    squadId: string,
    type: 'logo' | 'banner',
    onProgress?: UploadProgressCallback
): Promise<string> {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `squads/${squadId}/${type}_${Date.now()}.${ext}`;
    return uploadFile(file, path, onProgress);
}

/**
 * Delete a file from Firebase Storage by its full path.
 * Use cautiously — only call after confirming the URL belongs to Firebase.
 */
export async function deleteFirebaseFile(path: string): Promise<void> {
    const fileRef = ref(storage, path);
    await deleteObject(fileRef);
}
