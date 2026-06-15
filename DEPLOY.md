# Production Cloud Run & Firebase Hosting Runbook

This guide outlines how to deploy the full-stack **SDGs Clubs Platform** to your private Google Cloud Project (`sdgs-clubs`) and connect it to your Firebase custom domain (`https://sdgs-clubs.web.app`).

---

## 1. Architectural Overview

When you build your application in **Google AI Studio**, it compiles and runs inside an isolated, secure multi-tenant sandbox container. 

```
               [ User Request ]
                      │
           ┌──────────┴──────────┐
           ▼                     ▼
   Firebase Hosting       Cloud Run (Your GCP Profile)
  (sdgs-clubs.web.app)    (sdgs-clubs-backend)
           │                     │
           └───────► Rewrite ◄───┘
```

Because of security and access isolation, the AI Studio development environment cannot log in directly to your private GCP account without safe external authentication. Therefore, the **final deployment commands must be executed from your local terminal where you have administrative access** to `gcloud` and `firebase`.

---

## 2. Prerequisites

Ensure you have the following CLI utilities installed on your machine:
* [Google Cloud SDK (gcloud CLI)](https://cloud.google.com/sdk/docs/install)
* [Firebase CLI (`firebase-tools`)](https://firebase.google.com/docs/cli)

Run these commands to log in and set your workspace active context:

```bash
# 1. Log in to Google Cloud
gcloud auth login

# 2. Set your active project to sdgs-clubs
gcloud config set project sdgs-clubs

# 3. Log in to Firebase CLI
firebase login

# 4. Link your local directory to your Firebase project
firebase use sdgs-clubs
```

---

## 3. Step-by-Step Deployment

To deploy your application, follow these steps in your local workspace directory:

### Step A: Deploy the Cloud Run Backend
We use standard container builds with the pre-configured, high-performance `Dockerfile` in the root folder:

```bash
# Deploy the container to Cloud Run (Europe-West2 region matches your configs)
gcloud run deploy sdgs-clubs-backend \
  --source . \
  --region europe-west2 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production"
```

> 🔑 **Important (Secrets Manager / Env Vars):**  
> If you utilize the Gemini API, you must inject your `GEMINI_API_KEY` into your Cloud Run service. You can do this securely during deployment:
> ```bash
> gcloud run services update sdgs-clubs-backend \
>   --region europe-west2 \
>   --set-env-vars="GEMINI_API_KEY=YOUR_SECURE_GEMINI_API_KEY"
> ```

---

### Step B: Enable the Firebase Hosting Rewrites (IAM Configuration)
Because Firebase Hosting uses a custom proxy rewrite to match the Cloud Run container backend, you must grant the special **Firebase Hosting Service Agent** permission to invoke your Cloud Run instance.

Run this simple command or configure it in your GCP Console:

```bash
# Allow the Firebase Hosting service agent to execute your Cloud Run service
gcloud run services add-iam-policy-binding sdgs-clubs-backend \
  --region=europe-west2 \
  --member="serviceAccount:service-675337056849@gcp-sa-firebasehosting.iam.gserviceaccount.com" \
  --role="roles/run.invoker"
```

---

### Step C: Deploy Firebase Configurations & Hosting
Once the backend container is running and permissions are set:

```bash
# 1. Run local compilation to generate static production assets
npm run build

# 2. Deploy your Firebase Hosting and Security Rules
firebase deploy --only hosting,firestore:rules
```

---

## 4. Troubleshooting & Verification

### "Site Not Found" on custom domain
This occurs when Firebase Hosting has not received any file deployments or is pointing to an empty directory. 
* Solution: Run `firebase deploy --only hosting` to synchronize the configuration rules in `firebase.json` containing the backend routing proxies.

### Check Service Status
Locate your Cloud Run logs to verify container initialization on port `3000`:
* Navigate to: [Google Cloud Run console (sdgs-clubs)](https://console.cloud.google.com/run/services?project=sdgs-clubs)
