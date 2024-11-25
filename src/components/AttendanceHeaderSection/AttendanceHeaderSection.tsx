const AttendanceHeader = () => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        alignItems: "center",
        backgroundColor: "white",
      }}
    >
      {/* Year Month */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          height: "100%",
          paddingLeft: "20px",
          fontWeight: "bold",
        }}
      >
        2024年10月度
      </div>

      {/* Title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          fontSize: "1.5rem",
          fontWeight: "bold",
        }}
      >
        出 勤 簿
      </div>
      {/* Empty Space to leave space on the right */}
      <div />

      {/* Main Content Section */}
      <div
        style={{
          gridColumn: "1 / 4",
          display: "grid",
          gridTemplateColumns: "3fr 5fr 2fr",
          gap: "0",
        }}
      >
        {/* Place Section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            alignItems: "stretch",
            border: "1px solid black",
            height: "100%",
          }}
        >
          {/* School Title */}
          <div
            style={{
              borderRight: "1px solid black",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              padding: "0 5px",
            }}
          >
            所属
          </div>
          {/* School Name */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: "100%",
              padding: "0 5px",
            }}
          >
            TryAngle Kids 南草津校
          </div>
        </div>

        {/* Name Section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 3fr",
            alignItems: "stretch",
            border: "1px solid black",
            height: "100%",
          }}
        >
          {/* Name Labels Container */}
          <div
            style={{
              display: "grid",
              gridTemplateRows: "1fr 1fr",
              borderRight: "1px solid black",
              height: "100%",
            }}
          >
            {/* Name Title English */}
            <div
              style={{
                borderBottom: "1px solid black",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                padding: "0 5px",
              }}
            >
              Name
            </div>
            {/* Name Title Japanese */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.875rem",
                height: "100%",
                padding: "0 5px",
              }}
            >
              氏名
            </div>
          </div>
          {/* Name Box Area */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: "100%",
              padding: "0 5px",
            }}
          >
            Gee Chai
          </div>
        </div>

        {/* Signature Section */}
        <div
          style={{
            display: "grid",
            gridTemplateRows: "1fr 1fr",
            border: "1px solid black",
            marginLeft: "20px",
            marginRight: "20px",
          }}
        >
          {/* Signature Title */}
          <div
            style={{
              textAlign: "left",
              borderBottom: "1px solid black",
              paddingLeft: "5px",
              paddingRight: "5px",
            }}
          >
            Signature
          </div>
          {/* Empty box area */}
          <div style={{ padding: "5px" }}></div>
        </div>

        {/* Empty Space */}
        <div />
      </div>
    </div>
  );
};

export default AttendanceHeader;
