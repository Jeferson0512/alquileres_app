import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AdminLayout title="Mi perfil">
            <Head title="Mi perfil" />

            <div className="mx-auto max-w-2xl space-y-4">
                <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-xl"
                    />
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
                    <UpdatePasswordForm className="max-w-xl" />
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
                    <DeleteUserForm className="max-w-xl" />
                </div>
            </div>
        </AdminLayout>
    );
}
