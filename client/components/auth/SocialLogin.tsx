export default function SocialLogin() {
  return (
    <>
      <div className="my-8 flex items-center">

        <div className="h-px flex-1 bg-slate-700" />

        <span className="mx-3 text-slate-500">
          OR
        </span>

        <div className="h-px flex-1 bg-slate-700" />

      </div>

      <button className="w-full rounded-xl border border-slate-700 py-4 text-white transition hover:bg-slate-800">

        Continue with Google

      </button>
    </>
  );
}