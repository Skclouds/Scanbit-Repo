/**
 * Minimal loader for iOS - no Lottie (fixes "Maximum call stack size exceeded").
 * Use instead of ProfessionalLoader on iOS Safari.
 */
export default function IOSLoader() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          border: '4px solid rgba(249,115,22,0.2)',
          borderTopColor: '#f97316',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <p style={{ marginTop: 16, fontSize: 16, color: '#374151' }}>Loading Scanbit...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
