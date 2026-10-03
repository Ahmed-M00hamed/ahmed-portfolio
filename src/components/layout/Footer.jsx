function Footer({ profile }) {
    return (
        <footer className="border-t border-slate-900 bg-slate-950">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-7 text-center text-xs text-slate-500 sm:px-6 sm:py-8 sm:flex-row sm:items-center sm:justify-between sm:text-left sm:text-sm">
                <p className="wrap-break-word">
                    © {new Date().getFullYear()}{' '}
                    {profile?.name || 'Ahmed Mohamed'}.
                    All rights reserved.
                </p>

                <p className="shrink-0">
                    Built with React & Supabase
                </p>
            </div>
        </footer>
    )
}

export default Footer