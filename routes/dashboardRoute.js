const express = require("express")
const Lead = require("../models/lead")
const verifyToken = require("../middleware/auth")
const { User } = require("../models/user")

const router = express.Router()


router.get("/", async (req, res) => {
  try {
    return res.status(200).send("dashboard route is working")
  } catch (error) {
    console.log("error:", error)
    return res.status(500).send(`Internal server error ${error.message}`)
  }
})

//daily , weekly , month report
router.get("/leadReport", verifyToken, async (req, res) => {
  const foundUser = req.foundUser;

  const allLeads = await Lead.find()

  if (!allLeads) {
    return res.status(400).send("No Leads Found");
  }

  try {
    function dailyLeads(allLeads) {
      const todayLeadArray = [];
      const yesterdayLeadArray = [];

      let currentDate = new Date();
      let todayDate = currentDate.getDate();
      let currentMonth = currentDate.getMonth() + 1;

      for (let data of allLeads) {
        const date = data.date.split(" ")[0];
        // console.log("date" , date)
        const dataMonth = +date.split("-")[1];
        const dataDay = +date.split("-")[2];
        // console.log("dataDay", dataDay);
        // console.log("data month , currentmont", dataMonth, currentMonth);
        if (dataMonth == +currentMonth) {
          if (dataDay == todayDate) {
            todayLeadArray.push(data);
          }
          if (dataDay == +todayDate - 1) {
            yesterdayLeadArray.push(data);
          }
        }
      }

      let object = {
        currentDayLeads: todayLeadArray.length,
        previousDayLeads: yesterdayLeadArray.length,
      };
      return object;
    }

    ///////////// weeklly lead report   ///////////////

    // console.log("allLeads" , allLeads)
    function weekllyLeads(allLeads) {
      if (foundUser.profile === "superAdmin") {
        // console.log(" we are in superadming weekly")
        const weeklyArray = [];
        const previousArray = [];

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentDay = currentDate.getDate();

        let weekNumber;

        if (currentDay >= 1 && currentDay <= 7) {
          weekNumber = 1;
        } else if (currentDay <= 14) {
          weekNumber = 2;
        } else if (currentDay <= 21) {
          weekNumber = 3;
        } else {
          weekNumber = 4;
        }

        // console.log("current week", weekNumber);

        for (let data of allLeads) {
          const date = data.date;
          // console.log("date" , date)
          let saprateDate = data.date.split(" ")[0];
          const dataMonth = +saprateDate.split("-")[1];
          const dataDay = +saprateDate.split("-")[2];
          // console.log("dataMonth ,  currentMonth", dataMonth , currentMonth);
          // console.log("dataday" , dataDay)
          if (dataMonth == currentMonth) {
            if (weekNumber == 1) {
              if (dataDay >= 1 && dataDay <= 7) {
                weeklyArray.push(data);
              }
            } else if (weekNumber == 2) {
              // console.log("in week 2");
              if (dataDay > 7 && dataDay <= 14) {
                // console.log("data" , data.date)
                // console.log("data push", dataDay);
                weeklyArray.push(data);
              }
            } else if (weekNumber == 3) {
              // console.log("in week 3");

              if (dataDay > 14 && dataDay <= 21) {
                weeklyArray.push(data);
              }
            } else if (weekNumber == 4) {
              // console.log("in week 4");
              if (dataDay > 21 && dataDay <= 31) {
                weeklyArray.push(data);
              }
              // weeklyArray.push(data);
            }
          }
        }

        // console.log("weekly Array" , weeklyArray)
        //last month same week

        for (let data of allLeads) {
          const date = data.date;
          let saprateDate = data.date.split(" ")[0];

          const dataMonth = +saprateDate.split("-")[1];
          const dataDay = +saprateDate.split("-")[2];
          //   console.log("dataDay pre", dataDay);
          //   console.log("data month , currentmont", dataMonth, currentMonth);
          //  console.log("weekNumber" , weekNumber,)

          if (dataMonth == +currentMonth - 1) {
            if (weekNumber == 1) {
              if (dataDay >= 1 && dataDay <= 7) {
                previousArray.push(data);
              }
            } else if (weekNumber == 2) {
              // console.log("in week 2 pre");
              if (dataDay <= 14) {
                // console.log("data push", dataDay);
                previousArray.push(data);
              }
            } else if (weekNumber == 3) {
              if (dataDay <= 21) {
                previousArray.push(data);
              }
            } else if (weekNumber == 4) {
              // console.log("in week 4");
              if (dataDay > 21 && dataDay <= 31) {
                weeklyArray.push(data);
              }
              // weeklyArray.push(data);
            }
          }
        }

        let object = {
          currentWeekLeads: weeklyArray.length,
          previousWeekLeads: previousArray.length,
        };

        return object;
      } else if (foundUser.profile === "salesTl") {
        console.log(" we are in salestl weekly");

        allLeads = allLeads.filter((item) => {
          return item.status === "New lead";
        });

        let object = {
          currentWeekLeads: allLeads.length,
          previousWeekLeads: 0,
        };
        return object;
      } else if (foundUser.profile === "salesExecutive") {
        console.log(" we are in salesexecutive weekly");

        allLeads = allLeads.filter((item) => {
          return item.status === "New lead";
        });

        let object = {
          currentWeekLeads: allLeads.length,
          previousWeekLeads: 0,
        };
        return object;
      } else if (foundUser.profile === "operationsTl") {
        console.log(" we are in operationstl weekly");
        const unwantedOperationsStatuses = [
          "Bucket - No Response",
          "completed",
        ];
        allLeads = allLeads.filter((item) => {
          return !unwantedOperationsStatuses.includes(item.operationStatus);
        });

        let object = {
          currentWeekLeads: allLeads.length,
          previousWeekLeads: 0,
        };
        return object;
      } else if (foundUser.profile === "operationsExecutive") {
        console.log(" we are in operationsexecutive weekly");
        const unwantedOperationsStatuses = [
          "Bucket - No Response",
          "completed",
        ];
        allLeads = allLeads.filter((item) => {
          return !unwantedOperationsStatuses.includes(item.operationStatus);
        });

        let object = {
          currentWeekLeads: allLeads.length,
          previousWeekLeads: 0,
        };
        return object;
      }
    }

    ///////////// monthly lead report   ///////////////

    function monthlyLeads(allLeads) {
      // console.log("all lead", allLeads);
      if (foundUser.profile === "superAdmin") {
        const currentMonthLeadArray = [];
        const previousMonthLeadArray = [];

        let currentDate = new Date();
        //console.log("date", currentDate);

        let currentMonth = currentDate.getMonth() + 1;
        let currentDay = currentDate.getDate();


        for (const data of allLeads) {
          // console.log("we are in current month block");
          const date = data.date;
          // console.log("date in db", date);
          let monthNumber = date.split("-")[1];

          let dayNumber = date.split("-")[2];


          if (currentMonth == monthNumber) {
            currentMonthLeadArray.push(data);
          }

          if (currentMonth == monthNumber) {
            if (currentDay < dayNumber) {
              break;
            }
          }
        }

        for (const data of allLeads) {
          // console.log("we are in previous month block");
          const date = data.date;
          let monthNumber = date.split("-")[1];
          let dayNumber = date.split("-")[2];
          if (currentMonth - 1 == monthNumber) {
            previousMonthLeadArray.push(data);
          }

          if (currentMonth - 1 == monthNumber) {
            if (currentDay < dayNumber) {
              break;
            }
          }
        }


        let object = {
          currentMonthLeads: currentMonthLeadArray.length,
          previousMonthLeads: previousMonthLeadArray.length,
        };
        return object;
      } else {
        let object = {
          currentMonthLeads: allLeads.length,
          previousMonthLeads: 0,
        };
        return object;
      }
    }
    const dailyLead = dailyLeads(allLeads);
    const weeklyLead = weekllyLeads(allLeads);
    const monthlyLead = monthlyLeads(allLeads);

    // console.log("weekllyLead info", weeklyLead);

    const mainObject = { dailyLead, weeklyLead, monthlyLead };
    console.log("main info", mainObject);

    return res.status(200).send(mainObject);
  } catch (error) {
    return res.status(500).send(`Internal Server Error-${error.message}`);
  }
});


//month wise lead api
router.get("/monthWiseLead", async (req, res) => {
  let allLead = await Lead.find()
  try {

    let january = 0;
    let february = 0;
    let march = 0;
    let april = 0;
    let may = 0;
    let june = 0;
    let july = 0;
    let august = 0;
    let september = 0;
    let october = 0;
    let november = 0;
    let december = 0;

    const currentDate = new Date();
    const year = currentDate.getFullYear(); // Get the last two digits of the year

    console.log("year", year)


    for (let item of allLead) {


      console.log("date.............. ", item.date)
      let [dbYear, dbMonth] = item.date.split(" ")[0].split("-");
      dbMonth = parseInt(dbMonth, 10); // Convert month to integer for comparison
      dbYear = parseInt(dbYear, 10);


      // console.log("dbYear" , dbYear)
      // console.log("dbYear year" , dbYear , year)

      console.log("dbYear and year", dbYear, year);
      if (dbYear == year) {
        console.log("we are in if block", dbMonth, item);




        // console.log("grosseAmount ,  gstAmount ,  repairCost ", grossAmount ,  gstAmount, repairCost)
        if (dbMonth == 1) {
          january++
        }

        if (dbMonth == 2) {
          console.log("month 2 is executed")
          february++
        }

        if (dbMonth == 3) {
          console.log("month is march");
          march++
        }
        if (dbMonth == 4) {
          april++
        }
        if (dbMonth == 5) {
          may++
        }
        if (june == 6) {
          january++
        }
        if (dbMonth == 7) {
          july++
        }
        if (dbMonth == 8) {
          august++
        }
        if (dbMonth == 9) {
          september++
        }

        if (dbMonth == 10) {
          october++
        }

        if (dbMonth == 11) {
          november++
        }

        if (dbMonth == 12) {
          december++
        }



      }

    }


    return res
      .status(200)
      .send([
        { january },
        { february },
        { march },
        { april },
        { may },
        { june },
        { july },
        { august },
        { september },
        { october },
        { november },
        { december },
      ]);
  } catch (error) {
    console.error("error", error);
    return res.status(500).send(`Internal server error ${error.message}`);
  }

});



//monthly closure
router.get("/monthClosure", verifyToken, async (req, res) => {

  const leadData = await Lead.find()

  try {
    let arr = []
    let january = 0;
    let february = 0;
    let march = 0;
    let april = 0;
    let may = 0;
    let june = 0;
    let july = 0;
    let august = 0;
    let september = 0;
    let october = 0;
    let november = 0;
    let december = 0;

    const currentDate = new Date();
    const year = currentDate.getFullYear(); // Get the last two digits of the year
    const month = ("0" + (currentDate.getMonth() + 1)).slice(-2);

    // console.log("year month" , year, month)



    // console.log("leadData", leadData)

    for (let data of leadData) {

      let [dbYear, dbMonth] = data.date.split("-");
      dbMonth = parseInt(dbMonth, 10); // Convert month to integer for comparison
      dbYear = parseInt(dbYear, 10);


      let productDetails = data.productDetails

      for(let item of  productDetails){
      let paymemt = +item.payment
      console.log("payment", paymemt)

      if (paymemt) {
        if (dbMonth == 1) {
          january += paymemt;
        }

        if (dbMonth == 2) {
          february += paymemt;
        }

        if (dbMonth == 3) {
          console.log("month is march");
          march += paymemt;
        }
        if (dbMonth == 4) {
          april += paymemt;
        }
        if (dbMonth == 5) {
          may += paymemt;
        }
        if (june == 6) {
          january += paymemt;
        }
        if (dbMonth == 7) {
          july += paymemt;
        }
        if (dbMonth == 8) {
          august += paymemt;
        }
        if (dbMonth == 9) {
          september += paymemt;
        }

        if (dbMonth == 10) {
          october += paymemt;
        }

        if (dbMonth == 11) {
          november += paymemt;
        }

        if (dbMonth == 12) {
          december += paymemt;
        }
      }


    }
  }

    console.log("arr testing data", arr)

    return res
      .status(200)
      .send([
        { january },
        { february },
        { march },
        { april },
        { may },
        { june },
        { july },
        { august },
        { september },
        { october },
        { november },
        { december },
      ]);
  } catch (error) {
    console.error("error", error);
    return res.status(500).send(`Internal server error ${error.message}`);
  }

});


//employee details
router.get("/employees", async (req, res) => {
  try {
    const allEmp = await User.find({ profile: "salesExecutive" })
    return res.status(200).send(allEmp)
  } catch (error) {
    console.log("error:", error)
    return res.status(500).send(`Internal server error ${error.message}`)
  }
})


////product finish reminder alert
// router.get("/api/productReminder", async (req, res) => {
//   console.log("product reminder is calling")
//   try {
//     const foundLead = await Lead.find()
//     for (let data of foundLead) {
//       let productDetails = data.productDetails


//       if (productDetails.length > 0) {
//         console.log("product details" , productDetails)
//         for (let item of foundLead) {
//           let date = item.date
//           let dayCount = item.duration

//           // Create a Date object for the given date
//           let newDate = new Date(date);

//           console.log("newDate" , newDate)
//           // Subtract the day count
//           newDate.setDate(newDate.getDate() + dayCount);

//           // Format the date as a string (optional, but often useful)
//           let resultDate = newDate.toISOString().split('T')[0];

//           console.log(  "result" , resultDate);

//         }
//       }
//     }
//     return res.status(200).send("dashboard route is working")
//   } catch (error) {
//     console.log("error:", error)
//     return res.status(500).send(`Internal server error ${error.message}`)
//   }
// })

router.get("/api/productReminder", async (req, res) => {
  console.log("product reminder is calling");
  let productAlertItem =  []
  try {
    const foundLeads = await Lead.find();
    for (let lead of foundLeads) {
      let productDetails = lead.productDetails;

      // Iterate over each product detail entry
      for (let detail of productDetails) {


        ////////

        if(detail.renewed === false){
        console.log("Product detail:", detail);

        // Check if date and duration are valid
        if (!detail.date || isNaN(new Date(detail.date).getTime())) {
          console.error("Invalid date found for product detail:", detail);
          continue; // Skip to the next product detail if the date is invalid
        }

        let duration = parseInt(detail.duration, 10);
        if (isNaN(duration) || duration <= 0) {
          console.error("Invalid duration found for product detail:", detail);
          continue; // Skip to the next product detail if the duration is invalid
        }

        let date = detail.date;
        let dayCount = duration;

        // Create a Date object for the given date
        let newDate = new Date(date);
        console.log("Original Date", newDate.toISOString().split('T')[0]);

        // Add the day count
        newDate.setDate(newDate.getDate() + dayCount);

        // Check if newDate is valid
        if (isNaN(newDate.getTime())) {
          console.error("Computed date is invalid after adding duration:", detail);
          continue; // Skip to the next product detail if the new computed date is invalid
        }

        // Format the date as a string (optional, but often useful)
        let resultDate = newDate.toISOString().split('T')[0];
        console.log("New Date", resultDate);

// resultDate = "2024-04-20"
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Create a Date object for the date "2024-06-14"
        const futureDate = new Date(resultDate);

        // console.log("future date" , futureDate)
        // console.log("today date" , today)
        // Compare the dates
        if (futureDate > today) {
          
          console.log("not store in array");
        } else {
          let object = {

            leadId : lead.leadId,
            name : detail.name,
            mobile : lead.mobile,
            email : lead.email,
            product : detail.name,
            buyDate : detail.date,
            buyQuantity : detail.duration,
            payment : detail.payment,
            rowId : detail.rowId
          }

          productAlertItem.push(object)
          console.log("store in array");
        }

      }
        //////////////////////////////////
      }
    }
    return res.status(200).send(productAlertItem);
  } catch (error) {
    console.log("error:", error);
    return res.status(500).send(`Internal server error ${error.message}`);
  }
});


module.exports = router