import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AdminLayout title="Mi perfil">
            <Head title="Mi perfil" />

            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
                        <UpdatePasswordForm />
                    </div>
                </div>

                <div className="rounded-lg border border-danger/30 border-t-4 border-t-danger bg-white p-4 sm:p-6">
                    <DeleteUserForm />
                </div>
            </div>
        </AdminLayout>
    );
}
