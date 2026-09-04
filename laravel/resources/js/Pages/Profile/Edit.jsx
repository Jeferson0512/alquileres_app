import { iniciales } from '@/lib/iniciales';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;

    return (
        <AdminLayout title="Mi perfil">
            <Head title="Mi perfil" />

            <div className="space-y-4">
                <div className="flex items-center gap-3.5 rounded-[13px] border border-border bg-surface p-4 shadow-sm sm:p-6">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-lg font-extrabold text-primary-dark">
                        {iniciales(user.name)}
                    </span>
                    <div className="min-w-0">
                        <div className="truncate text-base font-extrabold text-ink">
                            {user.name}
                        </div>
                        <div className="truncate text-sm text-muted">
                            {user.email}
                        </div>
                    </div>
                    {user.role && (
                        <span className="ml-auto shrink-0 rounded-full bg-primary-light px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-dark">
                            {user.role}
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="rounded-[13px] border border-border bg-surface p-4 shadow-sm sm:p-6">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </div>

                    <div className="rounded-[13px] border border-border bg-surface p-4 shadow-sm sm:p-6">
                        <UpdatePasswordForm />
                    </div>
                </div>

                <div className="rounded-[13px] border border-danger/30 border-t-4 border-t-danger bg-surface p-4 shadow-sm sm:p-6">
                    <DeleteUserForm />
                </div>
            </div>
        </AdminLayout>
    );
}
