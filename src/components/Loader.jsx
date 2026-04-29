export default function Loader({ fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="loader-overlay">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page-loader">
      <div className="spinner" />
    </div>
  );
}
