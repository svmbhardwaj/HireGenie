import { createBrowserRouter } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Protected from "./features/auth/components/Protected";
import AppLayout from "./components/AppLayout";
import Dashboard from "./features/dashboard/pages/Dashboard";
import ResumeAnalysis from "./features/resume/pages/ResumeAnalysis";
import InterviewPrep from "./features/interview/pages/InterviewPrep";
import StudyPlan from "./features/studyplan/pages/StudyPlan";
import SkillGaps from "./features/skillgaps/pages/SkillGaps";
import DevPreview from "./pages/DevPreview";

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/preview",
        element: <DevPreview />
    },
    {
        path: "/",
        element: <Protected><AppLayout /></Protected>,
        children: [
            {
                index: true,
                element: <Dashboard />
            },
            {
                path: "dashboard",
                element: <Dashboard />
            },
            {
                path: "resume-analysis",
                element: <ResumeAnalysis />
            },
            {
                path: "interview-prep",
                element: <InterviewPrep />
            },
            {
                path: "study-plan",
                element: <StudyPlan />
            },
            {
                path: "skill-gaps",
                element: <SkillGaps />
            }
        ]
    }
])